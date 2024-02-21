
import './App.css'
import AppBody from './layout/dataview/appbody';
import Footer from './layout/footer/footer';
import Navbar from './layout/navbar/navbar';

function App() {
  return (
    <div className='h-full bg-inherit'>
      <Navbar />
      <AppBody />
      <div className='p-10 text-red-400 text-center uppercase'>
      page is under construction ! 
      </div>
      <Footer />
      
    </div>  
  )
}

export default App
