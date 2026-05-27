const { jsPDF } = require('jspdf');
const handlebars = require('handlebars');
const path = require('node:path');
const fs = require('node:fs').promises;
const puppeteer = require('puppeteer');
const { CVTemplate, Resume, Student, User } = require('../models');

class PDFService {
  async generatePDF(userId, templateId, style = 'classic') {
    try {
      console.log('🎨 generatePDF recibido - userId:', userId, 'templateId:', templateId, 'style:', style);
      
      // Buscar el perfil de estudiante asociado al usuario
      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        throw new Error('Perfil de estudiante no encontrado. Por favor, completa tu perfil de estudiante primero.');
      }

      // Obtener el CV del estudiante
      const resume = await Resume.findOne({ where: { studentId: student.id } });
      if (!resume) {
        throw new Error('CV no encontrado. Por favor, completa tu CV primero.');
      }

      // Obtener la plantilla
      const template = await CVTemplate.findByPk(templateId);
      if (!template || !template.isActive) {
        throw new Error('Plantilla no encontrada o inactiva');
      }

      // Generar HTML con los datos del CV
      const resumeData = {
        personal: resume.personal,
        education: resume.education,
        experience: resume.experience || { items: [{
          company: "Sin experiencia laboral",
          position: "",
          startDate: "",
          endDate: "",
          description: "Aún no has añadido ninguna experiencia laboral. Completa tu perfil para mostrar tu experiencia aquí."
        }]},
        skills: resume.skills,
        languages: resume.languages,
        projects: resume.projects || { items: [{
          name: "Sin proyectos realizados",
          description: "Aún no has añadido ningún proyecto. Completa tu perfil para mostrar tus proyectos aquí.",
          technologies: "",
          url: ""
        }]}
      };
      
      console.log('📋 Datos del CV recuperados:', JSON.stringify(resumeData, null, 2));
      
      const html = await this.generateHTML(resumeData, template, student, style);
      
      // Generar PDF con estilo específico
      const pdfBuffer = await this.createPDFFromHTML(html, resumeData, style);

      // Guardar PDF en el sistema de archivos
      const fileName = `${student.firstName}_${student.lastName}_CV_${style}_${new Date().toISOString().split('T')[0]}.pdf`;
      const filePath = path.join(__dirname, '../../public/pdfs', fileName);
      
      // Asegurar que el directorio exista
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, pdfBuffer);

      // Actualizar el CV con la URL del PDF
      const pdfUrl = `/pdfs/${fileName}`;
      await resume.update({ 
        pdfUrl,
        templateId 
      });

      return {
        success: true,
        pdfUrl,
        fileName
      };

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error(`Error generando PDF: ${error.message}`);
    }
  }

  async generateHTML(resumeData, template, student, style = 'classic') {
    try {
      console.log('🔄 Generando HTML con Handlebars...');
      console.log('📋 resumeData recibido:', JSON.stringify(resumeData, null, 2));
      
      // Validar que resumeData no sea undefined
      if (!resumeData) {
        console.error('❌ resumeData es undefined');
        resumeData = {};
      }
      
      const { personal, education, experience, skills, languages, projects } = resumeData;
      console.log('📊 Experiencia items:', JSON.stringify(experience?.items || [], null, 2));
      console.log('📊 Proyectos items:', JSON.stringify(projects?.items || [], null, 2));
      console.log('📊 Datos extraídos:', {
        personal: !!personal,
        education: !!education,
        experience: !!experience,
        skills: !!skills,
        languages: !!languages,
        projects: !!projects
      });
      
      // Preparar datos para Handlebars
      const fullName = `${student.firstName} ${student.lastName}`;
      const templateData = {
        // Datos personales
        FULL_NAME: fullName,
        FULL_NAME_INITIAL: fullName.charAt(0),
        EMAIL: personal?.email || '',
        PHONE: personal?.phone || '',
        LINKEDIN: personal?.linkedin || '',
        
        // Educación
        DEGREE: education?.degree || '',
        INSTITUTION: education?.institution || '',
        START_DATE: education?.startDate || '',
        END_DATE: education?.endDate || '',
        
        // Experiencia
        EXPERIENCES: experience?.items || [],
        HAS_EXPERIENCES: experience?.items?.length > 0,
        EXPERIENCE: this.generateExperienceHTML(experience?.items || []),
        
        // Proyectos
        PROJECTS_DATA: projects?.items || [],
        HAS_PROJECTS: projects?.items?.length > 0,
        PROJECTS: this.generateProjectsHTML(projects?.items || []),
        
        // Habilidades
        TECHNICAL_SKILLS: skills?.technical || '',
        SOFT_SKILLS: skills?.soft || '',
        HAS_TECHNICAL_SKILLS: !!skills?.technical,
        HAS_SOFT_SKILLS: !!skills?.soft,
        
        // Idiomas
        LANGUAGES: languages?.list || '',
        HAS_LANGUAGES: !!languages?.list
      };

      // Leer plantilla directamente del archivo HTML para siempre tener la última versión
      let htmlTemplate;
      try {
        const templatePath = path.join(__dirname, '../templates', `${style}.html`);
        htmlTemplate = await fs.readFile(templatePath, 'utf8');
        console.log(`✅ Plantilla ${style} cargada desde archivo`);
      } catch (fileError) {
        console.warn(`⚠️ No se pudo cargar plantilla desde archivo, usando BD: ${fileError.message}`);
        htmlTemplate = template.htmlTemplate;
      }

      // Compilar plantilla con Handlebars
      const compiledTemplate = handlebars.compile(htmlTemplate);
      let html = compiledTemplate(templateData);
      
      // Agregar estilos CSS si existen
      if (template.cssStyles) {
        html = html.replace('</head>', `<style>${template.cssStyles}</style></head>`);
      }

      console.log('✅ HTML generado con Handlebars');
      return html;
      
    } catch (error) {
      console.error('❌ Error generando HTML:', error.message);
      throw error;
    }
  }

  async createPDFFromHTML(html, resumeData, templateStyle = 'classic') {
    try {
      console.log('🔄 Generando PDF con jsPDF - Estilo:', templateStyle);
      
      // Crear un documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurar márgenes según el estilo
      const config = this.getPDFConfig(pdf, templateStyle);

      // Renderizar según el estilo de plantilla
      let structuredText;
      switch (templateStyle) {
        case 'classic':
          await this.renderClassicTemplate(pdf, resumeData, config);
          break;
        case 'modern':
          {
            // Para la plantilla moderna, usar Puppeteer para renderizar HTML real
            console.log('🎨 Usando Puppeteer para plantilla moderna');
            const pdfBuffer = await this.createPDFFromHTMLWithPuppeteer(html);
            return pdfBuffer;
          }
        case 'creative':
          {
            // Para la plantilla creativa, usar Puppeteer para renderizar HTML real
            console.log('🎨 Usando Puppeteer para plantilla creativa');
            const pdfBuffer = await this.createPDFFromHTMLWithPuppeteer(html);
            return pdfBuffer;
          }
        default:
          // Fallback al método original
          structuredText = this.processHTMLForPDF(html, resumeData);
          this.renderFormattedText(pdf, structuredText, config);
          break;
      }

      // Generar el buffer del PDF
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      
      console.log('✅ PDF generado con jsPDF, tamaño:', pdfBuffer.length);
      return pdfBuffer;

    } catch (error) {
      console.error('❌ Error en createPDFFromHTML:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  getPDFConfig(pdf, templateStyle = 'classic') {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Configuración según el estilo
    const styles = {
      classic: {
        margin: 25, // 1.5 pulgadas ~ 38mm, pero usamos 25mm para mejor ajuste
        lineHeight: 6,
        font: 'times',
        titleSize: 18,
        headerSize: 12,
        subtitleSize: 10,
        contentSize: 10,
        titleColor: [26, 26, 46], // Azul marino
        headerColor: [26, 26, 46],
        lineColor: [211, 211, 211] // Gris claro
      },
      modern: {
        margin: 20,
        lineHeight: 5,
        font: 'helvetica',
        titleSize: 16,
        headerSize: 11,
        subtitleSize: 9,
        contentSize: 9,
        titleColor: [0, 0, 0],
        headerColor: [0, 0, 0],
        lineColor: [200, 200, 200]
      },
      creative: {
        margin: 15,
        lineHeight: 5,
        font: 'helvetica',
        titleSize: 20,
        headerSize: 12,
        subtitleSize: 10,
        contentSize: 10,
        titleColor: [255, 87, 34], // Naranja vibrante
        headerColor: [0, 123, 255], // Azul eléctrico
        accentColor: [76, 175, 80], // Verde neón
        secondaryColor: [156, 39, 176], // Púrpura vibrante
        lineColor: [150, 150, 150],
        backgroundColor: [245, 245, 250]
      }
    };
    
    const style = styles[templateStyle] || styles.classic;
    
    return {
      ...style,
      pageWidth,
      pageHeight,
      contentWidth: pageWidth - (style.margin * 2),
      contentHeight: pageHeight - (style.margin * 2)
    };
  }

  renderFormattedText(pdf, text, config) {
    const lines = text.split('\n');
    let yPosition = config.margin;
    
    for (const line of lines) {
      yPosition = this.processLine(pdf, line, yPosition, config);
    }
  }

  processLine(pdf, line, yPosition, config) {
    // Manejar salto de página
    if (yPosition > config.pageHeight - config.margin) {
      pdf.addPage();
      yPosition = config.margin;
    }
    
    const lineType = this.getLineType(line);
    yPosition = this.renderLine(pdf, line, lineType, yPosition, config);
    
    return yPosition;
  }

  getLineType(line) {
    const isTitle = line === line.toUpperCase() && 
                   (line.includes('DATOS PERSONALES') || 
                    line.includes('FORMACIÓN') || 
                    line.includes('EDUCACIÓN') || 
                    line.includes('EXPERIENCIA') || 
                    line.includes('HABILIDADES') || 
                    line.includes('IDIOMAS') || 
                    line.includes('PROYECTOS'));
    
    const isSubtitle = line.includes(':') && !isTitle;
    const isEmptyOrSeparator = line.trim() === '' || line.startsWith('-');
    
    return { isTitle, isSubtitle, isEmptyOrSeparator };
  }

  renderLine(pdf, line, lineType, yPosition, config) {
    if (lineType.isTitle) {
      return this.renderTitle(pdf, line, yPosition, config);
    } else if (lineType.isSubtitle) {
      return this.renderSubtitle(pdf, line, yPosition, config);
    } else if (lineType.isEmptyOrSeparator) {
      return this.renderSeparator(pdf, line, yPosition, config);
    } else {
      return this.renderNormalText(pdf, line, yPosition, config);
    }
  }

  renderTitle(pdf, line, yPosition, config) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(line, config.margin, yPosition);
    return yPosition + config.lineHeight + 2;
  }

  renderSubtitle(pdf, line, yPosition, config) {
    // Separar el subtítulo del contenido
    const colonIndex = line.indexOf(':');
    const hasColon = colonIndex >= 0;
    
    if (hasColon) {
      const subtitle = line.substring(0, colonIndex + 1);
      const content = line.substring(colonIndex + 1).trim();
      
      // Renderizar subtítulo en negrita y obtener su ancho
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      const subtitleWidth = pdf.getTextWidth(subtitle);
      pdf.text(subtitle, config.margin, yPosition);
      
      // Renderizar contenido con ajuste de texto
      if (content) {
        yPosition = this.renderSubtitleContent(pdf, content, yPosition, config, subtitleWidth);
      }
    } else {
      // Fallback: renderizar toda la línea en negrita si no hay ':'
      yPosition = this.renderFullLineBold(pdf, line, yPosition, config);
    }
    
    return yPosition + config.lineHeight;
  }

  renderSubtitleLabel(pdf, subtitle, yPosition, config) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(subtitle, config.margin, yPosition);
    return yPosition;
  }

  renderSubtitleContent(pdf, content, yPosition, config, subtitleWidth) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    // Agregar espacio después de los dos puntos
    const contentWithSpace = ' ' + content;
    
    // Calcular el ancho disponible para el contenido
    const availableWidth = config.contentWidth - subtitleWidth;
    
    // Dividir el contenido largo en líneas
    const wrappedContent = pdf.splitTextToSize(contentWithSpace, availableWidth);
    
    // Renderizar la primera línea del contenido junto al subtítulo
    if (wrappedContent.length > 0) {
      pdf.text(wrappedContent[0], config.margin + subtitleWidth, yPosition);
      
      // Renderizar las líneas adicionales debajo
      yPosition = this.renderAdditionalContentLines(pdf, wrappedContent, yPosition, config);
    }
    
    return yPosition;
  }

  renderAdditionalContentLines(pdf, wrappedContent, yPosition, config) {
    for (let i = 1; i < wrappedContent.length; i++) {
      yPosition += config.lineHeight;
      
      // Verificar salto de página
      yPosition = this.handlePageBreak(pdf, yPosition, config);
      
      pdf.text(wrappedContent[i], config.margin, yPosition);
    }
    
    return yPosition;
  }

  renderFullLineBold(pdf, line, yPosition, config) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(line, config.margin, yPosition);
    return yPosition;
  }

  handlePageBreak(pdf, yPosition, config) {
    if (yPosition > config.pageHeight - config.margin) {
      pdf.addPage();
      yPosition = config.margin;
    }
    return yPosition;
  }

  async renderClassicTemplate(pdf, resumeData, config) {
    let yPosition = config.margin;
    
    // Header con nombre y línea decorativa
    yPosition = this.renderClassicHeader(pdf, resumeData, yPosition, config);
    
    // Espacio después del header
    yPosition += 10;
    
    // Layout de dos columnas con más separación
    const leftColumnWidth = config.contentWidth * 0.35;
    const rightColumnWidth = config.contentWidth * 0.35;
    const columnGap = 20; // Aumentado de 10 a 20mm
    const leftX = config.margin;
    const rightX = config.margin + leftColumnWidth + columnGap;
    
    // Obtener datos de ambas columnas
    const leftData = this.getLeftColumnData(resumeData);
    const rightData = this.getRightColumnDataForColumns(resumeData);
    
    // Renderizar ambas columnas simultáneamente (solo datos personales, educación, idiomas, habilidades)
    yPosition = this.renderClassicTwoColumns(pdf, leftData, rightData, yPosition, config, leftX, rightX, leftColumnWidth, rightColumnWidth);
    
    // Espacio entre columnas y secciones inferiores
    yPosition += 15;
    
    // Renderizar secciones inferiores (Experiencia y Proyectos) en ancho completo
    this.renderClassicBottomSections(pdf, resumeData, yPosition, config);
    
    // Footer
    this.renderClassicFooter(pdf, config);
  }

  renderClassicTwoColumns(pdf, leftData, rightData, yPosition, config, leftX, rightX, leftColumnWidth, rightColumnWidth) {
    const columnConfig = {
      pdf,
      leftData,
      rightData,
      yPosition,
      config,
      leftX,
      rightX,
      leftColumnWidth,
      rightColumnWidth
    };
    
    return this.renderClassicTwoColumnsWithConfig(columnConfig);
  }

  renderClassicTwoColumnsWithConfig(columnConfig) {
    const { pdf, leftData, rightData, yPosition, config, leftX, rightX, leftColumnWidth, rightColumnWidth } = columnConfig;
    
    // Preparar secciones de cada columna
    const leftSections = [
      { title: 'DATOS PERSONALES', data: leftData.personal },
      { title: 'HABILIDADES', data: leftData.skills }
    ];
    
    const rightSections = [
      { title: 'EDUCACIÓN', data: rightData.education },
      { title: 'IDIOMAS', data: rightData.languages }
    ];
    
    // Renderizar secciones alternando entre columnas
    let leftY = yPosition;
    let rightY = yPosition;
    
    for (let i = 0; i < Math.max(leftSections.length, rightSections.length); i++) {
      // Renderizar sección izquierda si existe
      if (i < leftSections.length) {
        const section = leftSections[i];
        leftY = this.renderClassicSection(pdf, section.title, section.data, leftY, leftX, config, leftColumnWidth, true);
      }
      
      // Renderizar sección derecha si existe
      if (i < rightSections.length) {
        const section = rightSections[i];
        rightY = this.renderClassicSection(pdf, section.title, section.data, rightY, rightX, config, rightColumnWidth, false);
      }
    }
    
    // Devolver la posición Y más alta (la que más avanzó)
    return Math.max(leftY, rightY);
  }

  renderClassicHeader(pdf, resumeData, yPosition, config) {
    // Nombre centrado
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.titleSize);
    pdf.setTextColor(...config.titleColor);
    
    const name = resumeData?.personal?.fullName || 'Nombre del Candidato';
    const nameWidth = pdf.getTextWidth(name);
    const centerX = (config.pageWidth - nameWidth) / 2;
    
    pdf.text(name, centerX, yPosition);
    yPosition += 8;
    
    // Línea decorativa
    pdf.setDrawColor(...config.lineColor);
    pdf.setLineWidth(0.5);
    pdf.line(config.margin, yPosition, config.pageWidth - config.margin, yPosition);
    yPosition += 10;
    
    return yPosition;
  }

  getLeftColumnData(resumeData) {
    return {
      personal: resumeData?.personal || {},
      skills: resumeData?.skills || {}
    };
  }

  getRightColumnData(resumeData) {
    return {
      education: resumeData?.education || {},
      experience: resumeData?.experience || {},
      projects: resumeData?.projects || {}
    };
  }

  getRightColumnDataForColumns(resumeData) {
    return {
      education: resumeData?.education || {},
      languages: resumeData?.languages || {}
    };
  }

  renderClassicLeftColumn(pdf, data, yPosition, config, columnWidth) {
    const xPosition = config.margin;
    
    // Datos personales
    yPosition = this.renderClassicSection(pdf, 'DATOS PERSONALES', data.personal, yPosition, xPosition, config, columnWidth, true);
    
    // Habilidades
    yPosition = this.renderClassicSection(pdf, 'HABILIDADES', data.skills, yPosition, xPosition, config, columnWidth, true);
    
    return yPosition;
  }

  renderClassicRightColumn(pdf, data, yPosition, config, xPosition, columnWidth) {
    // Educación
    yPosition = this.renderClassicSection(pdf, 'EDUCACIÓN', data.education, yPosition, xPosition, config, columnWidth, false);
    
    // Idiomas
    yPosition = this.renderClassicSection(pdf, 'IDIOMAS', data.languages, yPosition, xPosition, config, columnWidth, false);
    
    return yPosition;
  }

  renderClassicBottomSections(pdf, resumeData, yPosition, config) {
    // Renderizar EXPERIENCIA LABORAL en ancho completo
    if (resumeData?.experience) {
      yPosition = this.renderClassicSectionWithPageBreak(pdf, 'EXPERIENCIA LABORAL', resumeData.experience, yPosition, config.margin, config, config.contentWidth, false);
    }
    
    // Renderizar PROYECTOS en ancho completo
    if (resumeData?.projects) {
      yPosition = this.renderClassicSectionWithPageBreak(pdf, 'PROYECTOS', resumeData.projects, yPosition, config.margin, config, config.contentWidth, false);
    }
    
    return yPosition;
  }

  renderClassicSectionWithPageBreak(pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn) {
    const sectionConfig = {
      pdf,
      title,
      data,
      yPosition,
      xPosition,
      config,
      columnWidth,
      isLeftColumn
    };
    
    return this.renderClassicSectionWithPageBreakConfig(sectionConfig);
  }

  renderClassicSectionWithPageBreakConfig(sectionConfig) {
    const { pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn } = sectionConfig;
    
    // Verificar si necesitamos saltar de página antes de esta sección
    const estimatedHeight = this.estimateSectionHeight(title, data, config);
    const availableSpace = config.pageHeight - config.margin - 25; // 25mm para footer
    
    // Lógica más inteligente para saltos de página
    if (yPosition + estimatedHeight > availableSpace) {
      // Si es PROYECTOS y queda poco espacio, permitir que se divida entre páginas
      if (title === 'PROYECTOS' && yPosition > config.margin + 50) {
        // Dejar algunos proyectos en la página actual y el resto en la siguiente
        return this.renderClassicSectionWithSplit(pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn, availableSpace);
      } else {
        // Para otras secciones, hacer salto completo
        pdf.addPage();
        const newYPosition = config.margin;
        return this.renderClassicSection(pdf, title, data, newYPosition, xPosition, config, columnWidth, isLeftColumn);
      }
    }
    
    return this.renderClassicSection(pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn);
  }

  renderClassicSectionWithSplit(pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn, availableSpace) {
    const splitConfig = {
      pdf,
      title,
      data,
      yPosition,
      xPosition,
      config,
      columnWidth,
      isLeftColumn,
      availableSpace
    };
    
    return this.renderClassicSectionWithSplitConfig(splitConfig);
  }

  renderClassicSectionWithSplitConfig(splitConfig) {
    const { pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn, availableSpace } = splitConfig;
    
    if (title === 'PROYECTOS' && data.items && data.items.length > 0) {
      // Calcular espacio necesario para título y línea separadora
      const titleHeight = 6 + 4; // Título + línea separadora
      let currentY = yPosition;
      const projectsThatFit = [];
      const remainingProjects = [];
      
      // Determinar cuántos proyectos caben COMPLETAMENTE después del título
      for (const project of data.items) {
        const projectHeight = this.estimateSingleProjectHeight(project, config);
        if (currentY + titleHeight + projectHeight <= availableSpace) {
          projectsThatFit.push(project);
          currentY += projectHeight;
        } else {
          // Si un proyecto no cabe completo, va a la siguiente página
          remainingProjects.push(project);
        }
      }
      
      // Si ningún proyecto cabe, mover todo (título incluido) a la siguiente página
      if (projectsThatFit.length === 0) {
        pdf.addPage();
        const newYPosition = config.margin;
        return this.renderProjectsSection(pdf, data.items, newYPosition, xPosition, config, columnWidth);
      }
      
      // Si hay proyectos que caben, renderizar título y proyectos en página actual
      // Renderizar título
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.headerSize);
      pdf.setTextColor(...config.headerColor);
      pdf.text(title, xPosition, yPosition);
      currentY = yPosition + 6;
      
      // Línea separadora
      pdf.setDrawColor(...config.lineColor);
      pdf.setLineWidth(0.3);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(xPosition, currentY, xPosition + columnWidth, currentY);
      pdf.setLineDashPattern([], 0);
      currentY += 4;
      
      // Renderizar proyectos que caben en la página actual
      pdf.setFont(config.font, 'normal');
      pdf.setFontSize(config.contentSize);
      pdf.setTextColor(0, 0, 0);
      
      for (const project of projectsThatFit) {
        currentY = this.renderSingleProject(pdf, project, currentY, xPosition, config, columnWidth);
      }
      
      // Si hay proyectos restantes, hacer salto de página y continuar SIN repetir título
      if (remainingProjects.length > 0) {
        pdf.addPage();
        const newYPosition = config.margin;
        return this.renderRemainingProjects(pdf, remainingProjects, newYPosition, xPosition, config, columnWidth, isLeftColumn, false);
      }
      
      return currentY;
    }
    
    // Fallback al método normal
    return this.renderClassicSection(pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn);
  }

  estimateSingleProjectHeight(project, config) {
    let height = 6; // Título del proyecto
    if (project.description) {
      // Estimar líneas de descripción
      const descriptionLines = Math.ceil(project.description.length / 80); // ~80 caracteres por línea
      height += descriptionLines * config.lineHeight + 3; // 3mm de espacio
    }
    return height + 3; // Espacio entre proyectos
  }

  renderSingleProject(pdf, project, yPosition, xPosition, config, columnWidth) {
    // Título del proyecto
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.subtitleSize);
    pdf.text(project.title, xPosition, yPosition);
    yPosition += config.lineHeight;
    
    // Descripción
    pdf.setFont(config.font, 'normal');
    if (project.description) {
      const wrappedLines = pdf.splitTextToSize(project.description, columnWidth - 5);
      for (const line of wrappedLines) {
        pdf.text(line, xPosition, yPosition);
        yPosition += config.lineHeight;
      }
    }
    
    return yPosition + 3; // Espacio entre proyectos
  }

  renderRemainingProjects(pdf, remainingProjects, yPosition, xPosition, config, columnWidth, isLeftColumn, showTitle = true) {
    const remainingConfig = {
      pdf,
      remainingProjects,
      yPosition,
      xPosition,
      config,
      columnWidth,
      isLeftColumn,
      showTitle
    };
    
    return this.renderRemainingProjectsConfig(remainingConfig);
  }

  renderRemainingProjectsConfig(remainingConfig) {
    const { pdf, remainingProjects, yPosition, xPosition, config, columnWidth, showTitle } = remainingConfig;
    
    let currentY = yPosition;
    
    // Renderizar título de continuación solo si se solicita
    if (showTitle) {
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.headerSize);
      pdf.setTextColor(...config.headerColor);
      pdf.text('PROYECTOS (cont.)', xPosition, currentY);
      currentY += 6;
      
      // Línea separadora
      pdf.setDrawColor(...config.lineColor);
      pdf.setLineWidth(0.3);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(xPosition, currentY, xPosition + columnWidth, currentY);
      pdf.setLineDashPattern([], 0);
      currentY += 4;
    }
    
    // Renderizar proyectos restantes
    pdf.setFont(config.font, 'normal');
    pdf.setFontSize(config.contentSize);
    pdf.setTextColor(0, 0, 0);
    
    for (const project of remainingProjects) {
      currentY = this.renderSingleProject(pdf, project, currentY, xPosition, config, columnWidth);
    }
    
    return currentY;
  }

  renderProjectsSection(pdf, projects, yPosition, xPosition, config, columnWidth) {
    // Renderizar título "PROYECTOS" sin "(cont.)"
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.headerSize);
    pdf.setTextColor(...config.headerColor);
    pdf.text('PROYECTOS', xPosition, yPosition);
    yPosition += 6;
    
    // Línea separadora
    pdf.setDrawColor(...config.lineColor);
    pdf.setLineWidth(0.3);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(xPosition, yPosition, xPosition + columnWidth, yPosition);
    pdf.setLineDashPattern([], 0);
    yPosition += 4;
    
    // Renderizar todos los proyectos
    pdf.setFont(config.font, 'normal');
    pdf.setFontSize(config.contentSize);
    pdf.setTextColor(0, 0, 0);
    
    for (const project of projects) {
      yPosition = this.renderSingleProject(pdf, project, yPosition, xPosition, config, columnWidth);
    }
    
    return yPosition;
  }

  estimateSectionHeight(title, data, config) {
    let height = 20; // Título + línea separadora + espacios
    
    // Estimar altura según el tipo de sección
    switch (title) {
      case 'EXPERIENCIA LABORAL':
        if (data.items && data.items.length > 0) {
          height += data.items.length * 12; // Cada experiencia ~12mm (más optimizado)
        }
        break;
      case 'PROYECTOS':
        if (data.items && data.items.length > 0) {
          height += data.items.length * 15; // Cada proyecto ~15mm (más optimizado)
        }
        break;
      default:
        height += 8; // Sección simple (más optimizado)
    }
    
    return height;
  }

  renderClassicSection(pdf, title, data, yPosition, xPosition, config, columnWidth, isLeftColumn) {
    const sectionConfig = {
      title,
      data,
      yPosition,
      xPosition,
      config,
      columnWidth,
      isLeftColumn
    };
    
    return this.renderClassicSectionWithConfig(pdf, sectionConfig);
  }

  renderClassicSectionWithConfig(pdf, sectionConfig) {
    const { title, data, yPosition, xPosition, config, columnWidth } = sectionConfig;
    let currentYPosition = yPosition;
    
    // Título de sección
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.headerSize);
    pdf.setTextColor(...config.headerColor);
    pdf.text(title, xPosition, currentYPosition);
    currentYPosition += 6;
    
    // Línea separadora punteada
    pdf.setDrawColor(...config.lineColor);
    pdf.setLineWidth(0.3);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(xPosition, currentYPosition, xPosition + columnWidth, currentYPosition);
    pdf.setLineDashPattern([], 0); // Resetear patrón
    currentYPosition += 4;
    
    // Contenido de la sección
    pdf.setFont(config.font, 'normal');
    pdf.setFontSize(config.contentSize);
    pdf.setTextColor(0, 0, 0);
    
    currentYPosition = this.renderClassicSectionContent(pdf, data, currentYPosition, xPosition, config, columnWidth, title);
    
    return currentYPosition + 8; // Espacio entre secciones
  }

  renderClassicSectionContent(pdf, data, yPosition, xPosition, config, columnWidth, sectionTitle) {
    switch (sectionTitle) {
      case 'DATOS PERSONALES':
        return this.renderClassicPersonalData(pdf, data, yPosition, xPosition, config);
      case 'IDIOMAS':
        return this.renderClassicLanguages(pdf, data, yPosition, xPosition, config);
      case 'HABILIDADES':
        return this.renderClassicSkills(pdf, data, yPosition, xPosition, config);
      case 'EDUCACIÓN':
        return this.renderClassicEducation(pdf, data, yPosition, xPosition, config);
      case 'EXPERIENCIA LABORAL':
        return this.renderClassicExperience(pdf, data, yPosition, xPosition, config, columnWidth);
      case 'PROYECTOS':
        return this.renderClassicProjects(pdf, data, yPosition, xPosition, config, columnWidth);
      default:
        return yPosition;
    }
  }

  renderSeparator(pdf, line, yPosition, config) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    if (line.trim() !== '') {
      pdf.text(line, config.margin, yPosition);
    }
    return yPosition + config.lineHeight;
  }

  renderClassicPersonalData(pdf, data, yPosition, xPosition, config) {
    const items = [
      { icon: '📧', label: 'Email', value: data.email },
      { icon: '📱', label: 'Teléfono', value: data.phone },
      { icon: '💼', label: 'LinkedIn', value: data.linkedin }
    ];
    
    for (const item of items) {
      if (item.value) {
        // Icono y etiqueta en negrita
        pdf.setFont(config.font, 'bold');
        pdf.setFontSize(config.subtitleSize);
        const label = `${item.label}: `;
        pdf.text(label, xPosition, yPosition);
        
        // Valor normal
        pdf.setFont(config.font, 'normal');
        const labelWidth = pdf.getTextWidth(label);
        pdf.text(item.value, xPosition + labelWidth, yPosition);
        
        yPosition += config.lineHeight;
      }
    }
    
    return yPosition;
  }

  renderClassicLanguages(pdf, data, yPosition, xPosition, config) {
    if (data.list) {
      const languages = data.list.split(',').map(lang => lang.trim());
      for (const language of languages) {
        pdf.text(`• ${language}`, xPosition, yPosition);
        yPosition += config.lineHeight;
      }
    }
    return yPosition;
  }

  renderClassicSkills(pdf, data, yPosition, xPosition, config) {
    // Habilidades técnicas
    if (data.technical) {
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.subtitleSize);
      pdf.text('Técnicas:', xPosition, yPosition);
      yPosition += config.lineHeight;
      
      pdf.setFont(config.font, 'normal');
      const technicalSkills = data.technical.split(',').map(skill => skill.trim());
      for (const skill of technicalSkills) {
        pdf.text(`  • ${skill}`, xPosition, yPosition);
        yPosition += config.lineHeight;
      }
    }
    
    // Habilidades blandas
    if (data.soft) {
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.subtitleSize);
      pdf.text('Blandas:', xPosition, yPosition);
      yPosition += config.lineHeight;
      
      pdf.setFont(config.font, 'normal');
      const softSkills = data.soft.split(',').map(skill => skill.trim());
      for (const skill of softSkills) {
        pdf.text(`  • ${skill}`, xPosition, yPosition);
        yPosition += config.lineHeight;
      }
    }
    
    return yPosition;
  }

  renderClassicEducation(pdf, data, yPosition, xPosition, config) {
    if (data.degree) {
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.subtitleSize);
      pdf.text(data.degree, xPosition, yPosition);
      yPosition += config.lineHeight;
      
      pdf.setFont(config.font, 'normal');
      if (data.institution) {
        pdf.text(data.institution, xPosition, yPosition);
        yPosition += config.lineHeight;
      }
      
      if (data.startDate && data.endDate) {
        pdf.text(`${data.startDate} - ${data.endDate}`, xPosition, yPosition);
        yPosition += config.lineHeight;
      }
    }
    
    return yPosition;
  }

  renderClassicExperience(pdf, data, yPosition, xPosition, config, columnWidth) {
    if (data.items && data.items.length > 0) {
      for (const exp of data.items) {
        pdf.setFont(config.font, 'bold');
        pdf.setFontSize(config.subtitleSize);
        pdf.text(`${exp.company} - ${exp.role}`, xPosition, yPosition);
        yPosition += config.lineHeight;
        
        pdf.setFont(config.font, 'normal');
        if (exp.description) {
          const wrappedLines = pdf.splitTextToSize(exp.description, columnWidth - 5); // 5mm de margen interno
          for (const line of wrappedLines) {
            pdf.text(line, xPosition, yPosition);
            yPosition += config.lineHeight;
          }
        }
        
        yPosition += 3; // Espacio entre experiencias
      }
    } else {
      // Mostrar mensaje cuando no hay experiencia
      pdf.setFont(config.font, 'italic');
      pdf.setFontSize(config.contentSize);
      pdf.setTextColor(128, 128, 128); // Color gris
      pdf.text('Sin experiencia laboral', xPosition, yPosition);
      pdf.setTextColor(0, 0, 0); // Resetear a negro
      yPosition += config.lineHeight;
    }
    
    return yPosition;
  }

  renderClassicProjects(pdf, data, yPosition, xPosition, config, columnWidth) {
    if (data.items && data.items.length > 0) {
      for (const project of data.items) {
        pdf.setFont(config.font, 'bold');
        pdf.setFontSize(config.subtitleSize);
        pdf.text(project.title, xPosition, yPosition);
        yPosition += config.lineHeight;
        
        pdf.setFont(config.font, 'normal');
        if (project.description) {
          const wrappedLines = pdf.splitTextToSize(project.description, columnWidth - 5); // 5mm de margen interno
          for (const line of wrappedLines) {
            pdf.text(line, xPosition, yPosition);
            yPosition += config.lineHeight;
          }
        }
        
        yPosition += 3; // Espacio entre proyectos
      }
    } else {
      // Mostrar mensaje cuando no hay proyectos
      pdf.setFont(config.font, 'italic');
      pdf.setFontSize(config.contentSize);
      pdf.setTextColor(128, 128, 128); // Color gris
      pdf.text('Sin proyectos realizados', xPosition, yPosition);
      pdf.setTextColor(0, 0, 0); // Resetear a negro
      yPosition += config.lineHeight;
    }
    
    return yPosition;
  }

  renderClassicFooter(pdf, config) {
    const yPosition = config.pageHeight - config.margin + 10;
    
    // Línea decorativa
    pdf.setDrawColor(...config.lineColor);
    pdf.setLineWidth(0.5);
    pdf.line(config.margin, yPosition, config.pageWidth - config.margin, yPosition);
    
    // Número de página y fecha
    pdf.setFont(config.font, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    
    const date = new Date().toLocaleDateString('es-ES');
    const pageNumber = pdf.internal.getNumberOfPages();
    const footerText = `Página ${pageNumber} - Generado: ${date}`;
    
    const footerWidth = pdf.getTextWidth(footerText);
    const footerX = (config.pageWidth - footerWidth) / 2;
    
    pdf.text(footerText, footerX, yPosition + 5);
  }

  async renderCreativeTemplate(pdf, resumeData, config) {
    let yPosition = config.margin;
    
    // Header creativo con fondo de color vibrante
    this.renderCreativeHeader(pdf, resumeData, yPosition, config);
    yPosition += 35;
    
    // Espacio visual entre header y contenido
    yPosition += 10;
    
    // Renderizar secciones con diseño creativo
    yPosition = this.renderCreativeSection(pdf, 'DATOS PERSONALES', resumeData.personal, yPosition, config);
    yPosition += 8;
    
    yPosition = this.renderCreativeSection(pdf, 'EDUCACIÓN', resumeData.education, yPosition, config);
    yPosition += 8;
    
    yPosition = this.renderCreativeSection(pdf, 'EXPERIENCIA LABORAL', resumeData.experience, yPosition, config);
    yPosition += 8;
    
    yPosition = this.renderCreativeSection(pdf, 'HABILIDADES', resumeData.skills, yPosition, config);
    yPosition += 8;
    
    yPosition = this.renderCreativeSection(pdf, 'IDIOMAS', resumeData.languages, yPosition, config);
    yPosition += 8;
    
    this.renderCreativeSection(pdf, 'PROYECTOS', resumeData.projects, yPosition, config);
    
    // Footer creativo
    this.renderCreativeFooter(pdf, config);
  }

  renderCreativeHeader(pdf, resumeData, yPosition, config) {
    // Fondo vibrante para el header
    pdf.setFillColor(...config.headerColor);
    pdf.rect(config.margin, yPosition - 5, config.contentWidth, 40, 'F');
    
    // Nombre en color blanco y grande
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.titleSize);
    
    const fullName = `${resumeData.personal?.firstName || ''} ${resumeData.personal?.lastName || ''}`.trim();
    if (fullName) {
      pdf.text(fullName.toUpperCase(), config.margin + 10, yPosition + 10);
    }
    
    // Línea decorativa con color accent
    pdf.setDrawColor(...config.accentColor);
    pdf.setLineWidth(2);
    pdf.line(config.margin + 10, yPosition + 18, config.margin + config.contentWidth - 10, yPosition + 18);
    
    // Información de contacto en color secundario
    pdf.setTextColor(...config.secondaryColor);
    pdf.setFont(config.font, 'normal');
    pdf.setFontSize(config.contentSize);
    
    const contactInfo = [];
    if (resumeData.personal?.email) contactInfo.push(`📧 ${resumeData.personal.email}`);
    if (resumeData.personal?.phone) contactInfo.push(`📱 ${resumeData.personal.phone}`);
    if (resumeData.personal?.linkedin) contactInfo.push(`💼 ${resumeData.personal.linkedin}`);
    
    let contactX = config.margin + 10;
    contactInfo.forEach(info => {
      pdf.text(info, contactX, yPosition + 28);
      contactX += 80;
    });
    
    // Elementos decorativos
    this.renderCreativeDecorations(pdf, config);
  }

  renderCreativeDecorations(pdf, config) {
    // Círculos decorativos en las esquinas
    pdf.setFillColor(...config.accentColor);
    pdf.circle(config.margin + 5, config.margin + 5, 3, 'F');
    
    pdf.setFillColor(...config.secondaryColor);
    pdf.circle(config.pageWidth - config.margin - 5, config.margin + 5, 3, 'F');
    
    // Líneas diagonales decorativas
    pdf.setDrawColor(...config.lineColor);
    pdf.setLineWidth(0.5);
    pdf.setLineDashPattern([3, 3], 0);
    
    // Línea diagonal superior izquierda
    pdf.line(config.margin, config.margin + 10, config.margin + 15, config.margin);
    
    // Línea diagonal superior derecha
    pdf.line(config.pageWidth - config.margin, config.margin + 10, config.pageWidth - config.margin - 15, config.margin);
    
    pdf.setLineDashPattern([], 0);
  }

  renderCreativeSection(pdf, title, data, yPosition, config) {
    // Verificar si hay espacio para la sección
    if (yPosition > config.pageHeight - config.margin - 30) {
      pdf.addPage();
      yPosition = config.margin;
      this.renderCreativeDecorations(pdf, config);
    }
    
    // Título con fondo de color vibrante
    pdf.setFillColor(...config.headerColor);
    pdf.rect(config.margin, yPosition - 3, config.contentWidth, 8, 'F');
    
    // Título en blanco
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.headerSize);
    pdf.text(title, config.margin + 5, yPosition + 2);
    
    yPosition += 12;
    
    // Contenido de la sección
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(config.font, 'normal');
    pdf.setFontSize(config.contentSize);
    
    switch (title) {
      case 'DATOS PERSONALES':
        yPosition = this.renderCreativePersonalData(pdf, data, yPosition, config);
        break;
      case 'EDUCACIÓN':
        yPosition = this.renderCreativeEducation(pdf, data, yPosition, config);
        break;
      case 'EXPERIENCIA LABORAL':
        yPosition = this.renderCreativeExperience(pdf, data, yPosition, config);
        break;
      case 'HABILIDADES':
        yPosition = this.renderCreativeSkills(pdf, data, yPosition, config);
        break;
      case 'IDIOMAS':
        yPosition = this.renderCreativeLanguages(pdf, data, yPosition, config);
        break;
      case 'PROYECTOS':
        yPosition = this.renderCreativeProjects(pdf, data, yPosition, config);
        break;
    }
    
    return yPosition;
  }

  renderCreativePersonalData(pdf, data, yPosition, config) {
    if (!data) return yPosition;
    
    const fields = [
      { label: 'Email:', value: data.email, icon: '📧' },
      { label: 'Teléfono:', value: data.phone, icon: '📱' },
      { label: 'LinkedIn:', value: data.linkedin, icon: '💼' },
      { label: 'Dirección:', value: data.address, icon: '📍' }
    ];
    
    fields.forEach(field => {
      if (field.value) {
        // Icono y etiqueta en color accent
        pdf.setTextColor(...config.accentColor);
        pdf.setFont(config.font, 'bold');
        pdf.text(`${field.icon} ${field.label}`, config.margin + 5, yPosition);
        
        // Valor en color normal
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(config.font, 'normal');
        pdf.text(field.value, config.margin + 35, yPosition);
        
        yPosition += config.lineHeight;
      }
    });
    
    return yPosition;
  }

  renderCreativeEducation(pdf, data, yPosition, config) {
    if (!data?.institution) return yPosition;
    
    // Icono de educación
    pdf.setTextColor(...config.accentColor);
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.headerSize);
    pdf.text('🎓', config.margin + 5, yPosition);
    
    // Institución en color header
    pdf.setTextColor(...config.headerColor);
    pdf.setFont(config.font, 'bold');
    pdf.text(data.institution, config.margin + 15, yPosition);
    
    yPosition += config.lineHeight;
    
    if (data.degree) {
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(config.font, 'italic');
      pdf.text(data.degree, config.margin + 15, yPosition);
      yPosition += config.lineHeight;
    }
    
    if (data.duration) {
      pdf.setTextColor(...config.secondaryColor);
      pdf.setFont(config.font, 'normal');
      pdf.text(`📅 ${data.duration}`, config.margin + 15, yPosition);
      yPosition += config.lineHeight;
    }
    
    return yPosition;
  }

  renderCreativeExperience(pdf, data, yPosition, config) {
    if (!data?.items) return yPosition;
    
    data.items.forEach((item, index) => {
      // Icono de experiencia
      pdf.setTextColor(...config.accentColor);
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.headerSize);
      pdf.text('💼', config.margin + 5, yPosition);
      
      // Cargo y empresa
      pdf.setTextColor(...config.headerColor);
      pdf.setFont(config.font, 'bold');
      pdf.text(`${item.position} - ${item.company}`, config.margin + 15, yPosition);
      
      yPosition += config.lineHeight;
      
      if (item.duration) {
        pdf.setTextColor(...config.secondaryColor);
        pdf.setFont(config.font, 'normal');
        pdf.text(`📅 ${item.duration}`, config.margin + 15, yPosition);
        yPosition += config.lineHeight;
      }
      
      if (item.description) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(config.font, 'normal');
        const wrappedLines = pdf.splitTextToSize(item.description, config.contentWidth - 20);
        wrappedLines.forEach(line => {
          pdf.text(line, config.margin + 15, yPosition);
          yPosition += config.lineHeight;
        });
      }
      
      yPosition += 3; // Espacio entre experiencias
    });
    
    return yPosition;
  }

  renderCreativeSkills(pdf, data, yPosition, config) {
    if (!data) return yPosition;
    
    // Icono de habilidades
    pdf.setTextColor(...config.accentColor);
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.headerSize);
    pdf.text('⚡', config.margin + 5, yPosition);
    
    yPosition += config.lineHeight;
    
    // Habilidades técnicas
    if (data.technical) {
      pdf.setTextColor(...config.headerColor);
      pdf.setFont(config.font, 'bold');
      pdf.text('Técnicas:', config.margin + 15, yPosition);
      yPosition += config.lineHeight;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(config.font, 'normal');
      const technicalSkills = typeof data.technical === 'string' ? data.technical : data.technical.join(', ');
      const wrappedLines = pdf.splitTextToSize(technicalSkills, config.contentWidth - 20);
      wrappedLines.forEach(line => {
        pdf.text(`• ${line}`, config.margin + 20, yPosition);
        yPosition += config.lineHeight;
      });
    }
    
    // Habilidades blandas
    if (data.soft) {
      yPosition += 3;
      pdf.setTextColor(...config.secondaryColor);
      pdf.setFont(config.font, 'bold');
      pdf.text('Blandas:', config.margin + 15, yPosition);
      yPosition += config.lineHeight;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(config.font, 'normal');
      const softSkills = typeof data.soft === 'string' ? data.soft : data.soft.join(', ');
      const wrappedLines = pdf.splitTextToSize(softSkills, config.contentWidth - 20);
      wrappedLines.forEach(line => {
        pdf.text(`• ${line}`, config.margin + 20, yPosition);
        yPosition += config.lineHeight;
      });
    }
    
    return yPosition;
  }

  renderCreativeLanguages(pdf, data, yPosition, config) {
    if (!data?.languages) return yPosition;
    
    // Icono de idiomas
    pdf.setTextColor(...config.accentColor);
    pdf.setFont(config.font, 'bold');
    pdf.setFontSize(config.headerSize);
    pdf.text('🌍', config.margin + 5, yPosition);
    
    yPosition += config.lineHeight;
    
    const languages = typeof data.languages === 'string' ? data.languages : data.languages.join(', ');
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(config.font, 'normal');
    const wrappedLines = pdf.splitTextToSize(languages, config.contentWidth - 20);
    wrappedLines.forEach(line => {
      pdf.text(`• ${line}`, config.margin + 15, yPosition);
      yPosition += config.lineHeight;
    });
    
    return yPosition;
  }

  renderCreativeProjects(pdf, data, yPosition, config) {
    if (!data?.items) return yPosition;
    
    data.items.forEach((project, index) => {
      // Icono de proyecto
      pdf.setTextColor(...config.accentColor);
      pdf.setFont(config.font, 'bold');
      pdf.setFontSize(config.headerSize);
      pdf.text('🚀', config.margin + 5, yPosition);
      
      // Nombre del proyecto
      pdf.setTextColor(...config.headerColor);
      pdf.setFont(config.font, 'bold');
      pdf.text(project.title, config.margin + 15, yPosition);
      
      yPosition += config.lineHeight;
      
      if (project.description) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(config.font, 'normal');
        const wrappedLines = pdf.splitTextToSize(project.description, config.contentWidth - 20);
        wrappedLines.forEach(line => {
          pdf.text(line, config.margin + 15, yPosition);
          yPosition += config.lineHeight;
        });
      }
      
      yPosition += 3; // Espacio entre proyectos
    });
    
    return yPosition;
  }

  renderCreativeFooter(pdf, config) {
    const yPosition = config.pageHeight - config.margin - 10;
    
    // Línea decorativa con colores vibrantes
    pdf.setDrawColor(...config.accentColor);
    pdf.setLineWidth(2);
    pdf.line(config.margin, yPosition, config.margin + 50, yPosition);
    
    pdf.setDrawColor(...config.secondaryColor);
    pdf.line(config.margin + 50, yPosition, config.margin + 100, yPosition);
    
    pdf.setDrawColor(...config.headerColor);
    pdf.line(config.margin + 100, yPosition, config.pageWidth - config.margin, yPosition);
    
    // Texto del footer
    pdf.setTextColor(...config.lineColor);
    pdf.setFont(config.font, 'italic');
    pdf.setFontSize(8);
    
    const footerText = `Generado: ${new Date().toLocaleDateString('es-ES')} | Página {pageNum}`;
    const footerX = (config.pageWidth - pdf.getTextWidth(footerText)) / 2;
    
    pdf.text(footerText, footerX, yPosition + 5);
  }

  async renderModernTemplate(pdf, resumeData, config) {
    // Placeholder para plantilla moderna
    const structuredText = this.processHTMLForPDF('', resumeData);
    this.renderFormattedText(pdf, structuredText, config);
  }

  async createPDFFromHTMLWithPuppeteer(html) {
    try {
      console.log('🤖 Iniciando Puppeteer para renderizar HTML...');
      
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-default-apps',
            '--disable-translate',
            '--disable-device-discovery-notifications',
            '--disable-software-rasterizer',
            '--disable-background-timer-throttling'
          ]
        });
      } catch (error) {
        console.error('❌ Error iniciando Puppeteer:', error.message);
        throw new Error('No se pudo iniciar Puppeteer: ' + error.message);
      }

      const page = await browser.newPage();
      
      // Establecer el contenido HTML
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Generar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        preferCSSPageSize: true
      });

      await browser.close();
      
      console.log('✅ PDF generado con Puppeteer, tamaño:', pdfBuffer.length);
      return pdfBuffer;

    } catch (error) {
      console.error('❌ Error en createPDFFromHTMLWithPuppeteer:', error.message);
      throw error;
    }
  }

  processHTMLForPDF(html, resumeData) {
    try {
      // Eliminar CSS y scripts
      const cleanHTML = this.cleanHTML(html);
      
      // Extraer información básica usando datos del CV
      let result = this.extractBasicInfo(cleanHTML, resumeData);
      
      // Procesar secciones
      result += this.processSections(cleanHTML, resumeData);
      
      return result.trim();
      
    } catch (error) {
      console.error('❌ Error procesando HTML:', error.message);
      return this.fallbackTextExtraction(html);
    }
  }

  cleanHTML(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*>/gi, '');
  }

  extractBasicInfo(cleanHTML, resumeData) {
    let result = '';
    
    // Sección Datos Personales con formato mejorado
    result += 'DATOS PERSONALES\n';
    result += '-'.repeat(14) + '\n';
    
    // Nombre completo
    const titleMatch = cleanHTML.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
      result += `Nombre completo: ${titleMatch[1].trim()}\n`;
    }
    
    // Usar datos del CV para información de contacto con etiquetas
    if (resumeData?.personal?.email) {
      result += `Correo electrónico: ${resumeData.personal.email}\n`;
    }
    if (resumeData?.personal?.phone) {
      result += `Teléfono: ${resumeData.personal.phone}\n`;
    }
    if (resumeData?.personal?.linkedin) {
      result += `LinkedIn: ${resumeData.personal.linkedin}\n`;
    }
    
    result += '\n';
    console.log('📧 Contacto del CV:', { 
      email: resumeData?.personal?.email, 
      phone: resumeData?.personal?.phone, 
      linkedin: resumeData?.personal?.linkedin 
    });
    
    return result;
  }

  processSections(cleanHTML, resumeData) {
    const sections = ['EDUCACIÓN', 'EXPERIENCIA LABORAL', 'PROYECTOS', 'HABILIDADES', 'IDIOMAS'];
    let result = '';
    
    sections.forEach(section => {
      const sectionContent = this.extractSectionContent(cleanHTML, section);
      console.log(`📋 Sección ${section}:`, !!sectionContent);
      if (sectionContent || section === 'IDIOMAS') { // Siempre procesar idiomas
        result += this.formatSection(section, sectionContent, resumeData);
      }
    });
    
    return result;
  }

  extractSectionContent(cleanHTML, section) {
    const sectionRegex = new RegExp(`<h2[^>]*>${section}</h2>(.*?)(?=<h2|$)`, 'is');
    const sectionMatch = cleanHTML.match(sectionRegex);
    return sectionMatch ? sectionMatch[1] : null;
  }

  formatSection(sectionName, sectionContent, resumeData) {
    let result = `${sectionName}\n`;
    result += '-'.repeat(sectionName.length) + '\n';
    
    switch (sectionName) {
      case 'EDUCACIÓN':
        result += this.formatEducation(sectionContent, resumeData);
        break;
      case 'EXPERIENCIA LABORAL':
        result += this.formatExperience(resumeData);
        break;
      case 'PROYECTOS':
        result += this.formatProjects(resumeData);
        break;
      case 'HABILIDADES':
        result += this.formatSkills(resumeData);
        break;
      case 'IDIOMAS':
        result += this.formatLanguages(resumeData);
        break;
    }
    
    return result + '\n';
  }

  formatEducation(sectionContent, resumeData) {
    let result = '';
    
    // Usar datos del CV para mejor formato
    if (resumeData?.education) {
      const edu = resumeData.education;
      if (edu.degree) {
        result += `Título: ${edu.degree}\n`;
      }
      if (edu.institution) {
        result += `Institución: ${edu.institution}\n`;
      }
      if (edu.startDate) {
        result += `Fecha de inicio: ${edu.startDate}\n`;
      }
      if (edu.endDate) {
        result += `Fecha de fin: ${edu.endDate}\n`;
      }
    }
    
    console.log('🎓 Educación formateada:', result);
    return result;
  }

  formatExperience(resumeData) {
    if (resumeData?.experience?.items?.length > 0) {
      return resumeData.experience.items.map(exp => {
        let result = `Empresa: ${exp.company}\n`;
        result += `Rol: ${exp.role}\n`;
        if (exp.description) {
          result += `Descripción: ${exp.description}\n`;
        }
        result += '\n';
        return result;
      }).join('');
    }
    return 'Sin experiencia laboral previa\n';
  }

  formatProjects(resumeData) {
    if (resumeData?.projects?.items?.length > 0) {
      return resumeData.projects.items.map(proj => {
        let result = `Título: ${proj.title}\n`;
        if (proj.description) {
          result += `Descripción: ${proj.description}\n`;
        }
        result += '\n';
        return result;
      }).join('');
    }
    return 'Sin proyectos previos realizados\n';
  }

  formatSkills(resumeData) {
    let result = '';
    if (resumeData?.skills?.technical) {
      result += `Habilidades técnicas: ${resumeData.skills.technical}\n`;
    }
    if (resumeData?.skills?.soft) {
      result += `Habilidades blandas: ${resumeData.skills.soft}\n`;
    }
    return result;
  }

  formatLanguages(resumeData) {
    if (resumeData?.languages?.list) {
      return `Idiomas: ${resumeData.languages.list}\n`;
    }
    return '';
  }

  fallbackTextExtraction(html) {
    return html
      .replace(/<[^>]*>/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/^\s+|\s+$/gm, '')
      .trim();
  }

  async getAvailableTemplates() {
    try {
      const templates = await CVTemplate.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'description', 'category', 'thumbnailUrl'],
        order: [['name', 'ASC']]
      });

      return templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnailUrl: template.thumbnailUrl
      }));
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      throw new Error('Error obteniendo plantillas disponibles');
    }
  }

  generateExperienceHTML(experienceItems) {
    if (!experienceItems || experienceItems.length === 0) {
      return '<div class="no-experience">Sin experiencia laboral</div>';
    }
    
    return experienceItems.map(exp => `
      <div class="experience-item">
        <h4>${exp.company || 'Sin experiencia laboral'}</h4>
        ${exp.position ? `<div class="role">${exp.position}</div>` : ''}
        ${exp.startDate || exp.endDate ? `<div class="date">${exp.startDate || ''} - ${exp.endDate || ''}</div>` : ''}
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
      </div>
    `).join('');
  }

  generateProjectsHTML(projectsItems) {
    if (!projectsItems || projectsItems.length === 0) {
      return '<div class="no-projects">Sin proyectos realizados</div>';
    }
    
    return projectsItems.map(project => `
      <div class="project-item">
        <h4>${project.name || 'Sin proyectos realizados'}</h4>
        ${project.description ? `<div class="description">${project.description}</div>` : ''}
        ${project.technologies ? `<div class="technologies"><strong>Tecnologías:</strong> ${project.technologies}</div>` : ''}
        ${project.url ? `<div class="url"><strong>URL:</strong> ${project.url}</div>` : ''}
      </div>
    `).join('');
  }
}

module.exports = new PDFService();
