import './App.css'
import {type Template, Templates, TemplateSelect} from './components/template.select';
import {useCallback, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {DashedCodes} from "@/code-list.ts";
import { DropZone } from "@/drop-zone.tsx";
import {DownloadIcon} from "lucide-react";
import {encodeCode128} from "@/code128.ts";
import {getPDF, parseExcelFirstColumn, triggerDownload} from "@/common.ts";
import logo from './assets/logo.png';

function App() {
  const [ template, setTemplate ] = useState<Template>(Templates[0]);
  const [ codesText, setCodesText ] = useState<string>('');
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  const getTemplate = useCallback(() => {
    // should offer to download "/vzor.xlsx" file
    const link = document.createElement('a');
    link.href = '/vzor.xlsx';
    link.download = 'vzor.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    const stickers = codesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const code = line.trim().replace(/\u2013/g, '-');
        const prefix = `${code.split('-')[0]}-`;
        const useDash = DashedCodes.includes(prefix);
        return {
          code,
          barcode: encodeCode128(useDash ? code : code.replace(/-/g, '')),
          prefix: line.split('-')[0]
        }
      });


    try {
      const {pdfURL} = await getPDF(template.id, stickers);
      setIsLoading(false);
      const newWindow = window.open(pdfURL, '_blank');
      if (newWindow) {
        // PDF sa úspešne otvorilo v novom okne
        console.log('PDF bolo otvorené v novom okne');

        // Vyčisti URL po zatvorení okna (voliteľné)
        newWindow.addEventListener('beforeunload', () => {
          URL.revokeObjectURL(pdfURL);
        });
      } else {
        // Popup blocker alebo iný problém - ponúkni download
        triggerDownload(pdfURL, `${template.id}-${new Date().getTime()}.pdf`);
      }

    } catch (error) {
      console.error('Chyba pri sťahovaní PDF:', error);
      throw error;
    }
  }, [ codesText, template.id ]);

  return (
    <div className="min-h-svh w-full h-full overflow-hidden ">
      <div className={"w-full flex items-center justify-center h-[93px]"}>
        <div className="flex-2 flex justify-center">
          <img src={logo} alt="Logo" className="h-auto mx-auto max-w-28"/>
        </div>
        <div className="flex-3 pr-8 pl-8">
          <div className={"text-sm"}>Etiketa:</div>
          <TemplateSelect selected={template} onChange={setTemplate}/>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <div className="flex-2">
          <div
            className="flex items-center justify-center"
            style={{height: 'calc(100vh - 93px)'}}>
            <img
              src={`/templates/${template.image}`}
              alt={template.name}
              className="mt-4 w-[75%] h-auto  shadow-xl"
            />
          </div>
        </div>
        <div className="flex-3 pr-8 pl-8">
          <div className="ml-8">Názov etikety:</div>
          <div className="ml-8 text-xl font-bold mb-16">{template.name}</div>

          <div className="flex">
            <div className="flex-1 pr-8 pl-8">
              <div className="text-xl text-center mb-4 font-bold">
                Generovať zo súboru
              </div>
              <DropZone
                acceptedTypes=".xlsx"
                multiple={false}
                onFilesSelected={async (files) => {
                  const file = files[0];
                  if (file) {
                    const result = await parseExcelFirstColumn(files);
                    const codes = result.data as string[];
                    console.log('codes', codes);
                    codes.shift(); // Odstrániť hlavičku
                    setCodesText(codes.join('\n'));
                  }
                }}
              />

              <Button className={"mt-8"} variant="outline" onClick={getTemplate}>
                Vzorová šablóna
                <div className="text-green-700">
                  <DownloadIcon/>
                </div>
              </Button>
            </div>
            <div className="flex-1 pr-8 pl-8">
              <div className="text-xl text-center mb-4 font-bold">
                Generovať zo zoznamu
              </div>
              <textarea
                value={codesText}
                onChange={(e) => setCodesText(e.target.value)}
                className="w-full h-[400px] p-4 border border-gray-300 rounded-lg"
                placeholder="Sem napíšte alebo vložte kódy..."/>

              <div className="flex justify-end mr-8 w-full mt-8">
                <Button
                  disabled={isLoading}
                  onClick={generate}
                  className="bg-green-600">
                  {isLoading ? 'Generujem...' : 'Generovať PDF'}
                </Button>
              </div>
            </div>
          </div>
          <div className={"h-16"}></div>
        </div>
      </div>
    </div>
  )
}

export default App
