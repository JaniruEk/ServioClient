// App.jsx
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Appointment from './pages/Appointment';
import Testpage from './pages/test';
import ServiceCenter from './pages/ServiceCenter';
import JobList from './pages/Joblist.jsx';
import SparePartsInventory from './pages/SparePartsInventory.jsx';
import ReportAndAnalyse from './pages/Report&Analyse.jsx';
import ServiceAndRepairInvoice from './pages/Service&RepairInvoice.jsx';
import AppointmentForm from './pages/AppointmentForm.jsx';



function App() {
  return (
  
    <Routes>
      
      <Route path="/" element={<ServiceCenter />} />
      <Route path="/test" element={<Testpage />} />
      <Route path='/dashboard' element={<ServiceCenter/>}/>
      <Route path='/job-list' element={<JobList/>}/>
      <Route path='/service-details' element={<ServiceCenter/>}/>
      <Route path='/sparepartsInventory' element={<SparePartsInventory/>}/>
      <Route path="/Report&Analyse" element={<ReportAndAnalyse/>}/>
      <Route path='/ServiceAndRepairInvoice' element={<ServiceAndRepairInvoice/>}/>
      <Route path='/Appointment' element={<Appointment />} />
      <Route path='/appointment-form' element={<AppointmentForm/>}/>

      
    </Routes>
    
  );
}

export default App;
