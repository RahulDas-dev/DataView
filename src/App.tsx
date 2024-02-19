
import './App.css'
import AppBody from './layout/dataview/appbody';
import Footer from './layout/footer/footer';
import Navbar from './layout/navbar/navbar';

function App() {
  return (
    <div className='h-full bg-inherit'>
      <Navbar />
      <AppBody />
      <Footer />
    </div>  
  )
}

export default App
