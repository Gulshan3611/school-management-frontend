import { useState, useEffect } from 'react';
import { Type, Check } from 'lucide-react';

const FONTS = [
  { name: 'Inter', family: 'Inter, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { name: 'Outfit', family: 'Outfit, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap' },
  { name: 'Poppins', family: 'Poppins, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap' },
  { name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' },
  { name: 'Nunito', family: 'Nunito, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
  { name: 'Quicksand', family: 'Quicksand, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap' },
  { name: 'Roboto', family: 'Roboto, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' }
];

export function FontPreview() {
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);

  useEffect(() => {
    // Inject selected font if not already present
    const linkId = `google-font-${selectedFont.name.replace(/\s+/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = selectedFont.url;
      document.head.appendChild(link);
    }
  }, [selectedFont]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy-900 flex items-center gap-3">
          <Type className="text-saffron-500" size={32} /> Typography Settings
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Preview how different fonts change the look and feel of the app.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Font Selectors */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-slate-700 mb-4 px-1 uppercase tracking-wider text-xs">Select Web Font</h3>
          {FONTS.map(font => (
            <button
              key={font.name}
              onClick={() => setSelectedFont(font)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                selectedFont.name === font.name 
                ? 'bg-navy-900 border-navy-900 text-white shadow-md shadow-navy-200' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-navy-300 hover:shadow-sm'
              }`}
              style={{ fontFamily: font.family }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight">{font.name}</span>
                <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${selectedFont.name === font.name ? 'text-navy-200' : 'text-slate-400'}`}>sans-serif</span>
              </div>
              {selectedFont.name === font.name && <Check size={18} className="text-saffron-400" />}
            </button>
          ))}
          
          <div className="mt-8 p-4 bg-saffron-50 border border-saffron-100 rounded-xl">
            <h4 className="font-bold text-saffron-800 text-sm mb-2">How to apply:</h4>
            <p className="text-xs text-saffron-700 leading-relaxed">
              Once you choose your favorite font, tell me the name and I will permanently apply it to the entire application's global configuration.
            </p>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden" style={{ fontFamily: selectedFont.family }}>
          
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-saffron-500 uppercase tracking-widest mb-1">Live Preview</h2>
              <p className="text-3xl font-bold text-slate-900" style={{ fontWeight: 700 }}>{selectedFont.name} Typography</p>
            </div>
            <div className="text-right">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">Base: 14px</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Hierarchy Sample */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 border border-slate-100 rounded-xl p-6 bg-slate-50/50">
                <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Heading Hierarchy</h3>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Heading 1</h1>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">4xl / Bold / 700</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Heading 2</h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">2xl / Bold / 700</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">Heading 3</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">lg / Semibold / 600</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Heading 4</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">sm / Medium / 500</p>
                </div>
              </div>

              <div className="space-y-4 border border-slate-100 rounded-xl p-6 bg-slate-50/50">
                <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Paragraph Text</h3>
                <p className="text-base text-slate-800 leading-relaxed">
                  <strong>Base Text (16px):</strong> Education is the passport to the future, for tomorrow belongs to those who prepare for it today. The beautiful thing about learning is that no one can take it away from you.
                </p>
                <div className="h-px w-full bg-slate-200 my-4"></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Small Text (14px):</strong> The function of education is to teach one to think intensively and to think critically. Intelligence plus character - that is the goal of true education.
                </p>
              </div>
            </div>

            {/* UI Element Sample */}
            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Data Table Sample (Applied Row Padding)</h3>
                <button className="btn btn-primary btn-sm px-4 py-2 text-xs">Add Ne Student</button>
              </div>
              
              <div className="bg-white border text-sm border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">ID No.</th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Student Name</th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Class</th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="px-5 py-3 text-[13px] font-medium text-navy-900 border-b border-slate-100">2025001</td>
                      <td className="px-5 py-3 text-[13px] text-slate-700 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center text-xs font-bold">A</div>
                        Aarav Sharma
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 border-b border-slate-100">Class X-A</td>
                      <td className="px-5 py-3 text-[13px] border-b border-slate-100">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700">Active</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="px-5 py-3 text-[13px] font-medium text-navy-900 border-b border-slate-100">2025002</td>
                      <td className="px-5 py-3 text-[13px] text-slate-700 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">P</div>
                        Priya Singh
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 border-b border-slate-100">Class IX-B</td>
                      <td className="px-5 py-3 text-[13px] border-b border-slate-100">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600">Pending</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
