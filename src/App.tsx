import { ErrorBoundary } from './components/ErrorBoundary';
import TitleBar from './components/TitleBar';
import Appbody from './components/Appbody';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TitleBar />
        <Appbody />
      </div>
    </ErrorBoundary>
  );
}

export default App;
