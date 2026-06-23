const fs = require('fs');
let c = fs.readFileSync('client/src/pages/AdminDashboardPage.jsx', 'utf8');
const searchStr = {activeTab === 'reports' && ( + '\n' +
            <div className=" bg-white rounded-2xl shadow-sm p-12 text-center\>\n +
 <div className=\mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700\>;
const start = c.indexOf({activeTab === 'reports' && ();
if(start !== -1) {
 const end = c.indexOf(')}', start) + 2;
 const newStr = {activeTab === 'reports' && (
 <div className=\space-y-6\>
 <div className=\bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4\>
 <div className=\flex gap-4 items-center\>
 <div>
 <label className=\block text-xs font-medium text-gray-500 mb-1\>Fecha inicio</label>
 <input type=\date\ value={reportFilters.startDate} onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })} className=\border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500\ />
 </div>
 <div>
 <label className=\block text-xs font-medium text-gray-500 mb-1\>Fecha fin</label>
 <input type=\date\ value={reportFilters.endDate} onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })} className=\border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500\ />
 </div>
 <div className=\flex items-end h-full\>
 <button onClick={fetchReports} className=\bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition\>Filtrar</button>
 </div>
 </div>
 <button onClick={handleExportCSV} className=\bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition\>Exportar CSV</button>
 </div>
 {reportsLoading ? (<div className=\flex justify-center items-center py-12\><div className=\animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600\></div></div>) : reportsData ? (<div className=\grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\><div className=\bg-white p-6 rounded-2xl shadow-sm border border-gray-100\><p className=\text-sm font-medium text-gray-500\>Usuarios Activos (Nuevos)</p><div className=\mt-2 flex items-baseline gap-2\><span className=\text-3xl font-bold text-gray-900\>{reportsData.newStudents}</span><span className=\text-sm text-gray-500\>estudiantes</span></div></div><div className=\bg-white p-6 rounded-2xl shadow-sm border border-gray-100\><p className=\text-sm font-medium text-gray-500\>Postulaciones Totales</p><div className=\mt-2 flex items-baseline gap-2\><span className=\text-3xl font-bold text-gray-900\>{reportsData.totalApplications}</span></div></div><div className=\bg-white p-6 rounded-2xl shadow-sm border border-gray-100\><p className=\text-sm font-medium text-gray-500\>Tasa de Contratación</p><div className=\mt-2 flex items-baseline gap-2\><span className=\text-3xl font-bold text-gray-900\>{reportsData.hiringRate}%</span><span className=\text-sm text-gray-500\>({reportsData.hiredApplications} aceptadas)</span></div></div><div className=\bg-white p-6 rounded-2xl shadow-sm border border-gray-100\><p className=\text-sm font-medium text-gray-500\>Módulos Más Utilizados</p><div className=\mt-2 flex flex-col gap-1 text-sm text-gray-700\><div className=\flex justify-between\><span>Simulaciones:</span><span className=\font-semibold\>{reportsData.totalSimulations}</span></div><div className=\flex justify-between\><span>Análisis CV:</span><span className=\font-semibold\>{reportsData.totalCVAnalysis}</span></div><div className=\flex justify-between\><span>Ofertas Publicadas:</span><span className=\font-semibold\>{reportsData.totalOffers}</span></div></div></div></div>) : (<div className=\bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500\>No hay datos de reportes.</div>)}
 </div>
 )};
 fs.writeFileSync('client/src/pages/AdminDashboardPage.jsx', c.substring(0, start) + newStr + c.substring(end));
 console.log('OK');
} else {
 console.log('Not found');
}
