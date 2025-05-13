import { ErrorBoundary } from './components/ErrorBoundary';
import TitleBar from './components/TitleBar';
import Appbody from './components/Appbody';
import { FiGithub } from 'react-icons/fi';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TitleBar />
        <Appbody />
        <footer className="w-full mt-20 flex flex-col items-center text-center text-gray-500 dark:text-gray-400">
          <div className="mb-2">
            Designed &amp; Built by <span className="font-semibold text-gray-700 dark:text-gray-200">Rahul</span>
            <a
              href={import.meta.env.VITE_GIT_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 hover:text-black dark:hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <FiGithub className="inline-block" />
            </a>
          </div>
          <div className="text-xs">
            React + Danfojs app, bundled with <span className="font-semibold">vite</span>.
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
