import './App.css'
import { TemplateSelect } from './components/template.select';
import {useState} from "react";

function App() {
  const [ template, setTemplate ] = useState<string | undefined>(undefined);

  return (
    <div className="flex min-h-svh w-full h-full overflow-hidden ">
      <div className="flex-1 bg-yellow-100">
        zoznam produktov
      </div>
      <div className="flex-1 bg-green-100">
        <div>
          <TemplateSelect value={template} onChange={setTemplate} />
        </div>
      </div>
    </div>
  )
}

export default App
