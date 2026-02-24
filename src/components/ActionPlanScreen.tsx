import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Printer, ShoppingBag } from 'lucide-react';
import { DesignPlan } from '../types';

interface ActionPlanScreenProps {
  plan: DesignPlan;
  actionPlanText: string;
  onBack: () => void;
}

export const ActionPlanScreen: React.FC<ActionPlanScreenProps> = ({ plan, actionPlanText, onBack }) => {
  const origUrl = `data:${plan.originalImage.mimeType};base64,${plan.originalImage.data}`;
  const finalUrl = `data:${(plan.generatedImage || plan.originalImage).mimeType};base64,${(plan.generatedImage || plan.originalImage).data}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] p-8 md:p-12 lg:p-16 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 uppercase tracking-widest text-xs font-semibold print:hidden"
      >
        <ArrowLeft size={14} />
        Back to Editing
      </button>

      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[#8c7a6b] uppercase tracking-widest text-sm font-semibold mb-3">
            Your Action Plan
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] leading-tight">
            Ready to Build
          </h1>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full hover:bg-[#2a2a2a] transition-colors font-medium w-full md:w-auto print:hidden"
        >
          <Printer size={18} />
          Print Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">Original</h3>
            <img src={origUrl} alt="Original" className="w-full rounded-xl shadow-sm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">Final Design</h3>
            <img src={finalUrl} alt="Final" className="w-full rounded-xl shadow-sm border-2 border-[#8c7a6b]" />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100" id="printable-action-plan">
          <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[#8c7a6b] prose-li:marker:text-[#8c7a6b]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {actionPlanText}
            </ReactMarkdown>
          </div>

          {plan.shoppableItems && plan.shoppableItems.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-serif text-[#1a1a1a] mb-6 flex items-center gap-2">
                <ShoppingBag className="text-[#8c7a6b]" size={24} />
                Shop the Look
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plan.shoppableItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-4 rounded-xl border border-gray-100 bg-[#f9f8f6] hover:border-[#8c7a6b] hover:shadow-sm transition-all group print:border-gray-300"
                  >
                    <span className="font-medium text-gray-800 group-hover:text-[#8c7a6b] transition-colors line-clamp-2 mb-2">
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 mt-auto">
                      Est. {item.estimatedPrice}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
