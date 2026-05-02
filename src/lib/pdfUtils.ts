import { Question } from "../types";

export async function generatePDF(questions: Question[]) {
  // Create a hidden div for printing
  let printDiv = document.getElementById('print-section');
  if (!printDiv) {
    printDiv = document.createElement('div');
    printDiv.id = 'print-section';
    document.body.appendChild(printDiv);
  } else {
    printDiv.innerHTML = '';
  }

  // Build the content
  const content = document.createElement('div');
  content.className = 'p-4 print:p-0';
  
  const header = document.createElement('div');
  header.className = 'mb-8 border-b-2 border-black pb-4 flex justify-between items-end';
  header.innerHTML = `
    <div>
      <h1 class="text-3xl font-bold">错题举一反三特训</h1>
      <p class="text-sm text-gray-500">生成日期: ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="text-right">
      <p class="text-sm font-bold">共计: ${questions.length} 道错题</p>
    </div>
  `;
  content.appendChild(header);

  questions.forEach((q, idx) => {
    const qSection = document.createElement('div');
    qSection.className = 'mb-8 page-break-inside-avoid';
    
    let html = `
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-black text-white px-2 py-0.5 text-xs font-bold">题 ${idx + 1}</span>
          <span class="text-xs font-bold font-mono">[${q.knowledgePoint}]</span>
        </div>
        <div class="text-lg font-serif mb-3">${q.content}</div>
        ${q.options ? `
          <div class="grid grid-cols-2 gap-4 mb-3">
            ${q.options.map((opt, i) => `
              <div class="text-sm flex gap-2">
                <span class="font-bold">${String.fromCharCode(65 + i)}.</span>
                <span>${opt}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg mb-6">
        <h4 class="text-xs font-bold uppercase mb-2">【原题答案与解析】</h4>
        <div class="text-sm italic mb-1">答案: ${q.answer}</div>
        <div class="text-xs text-gray-600">${q.explanation}</div>
      </div>

      ${q.variations && q.variations.length > 0 ? `
        <div class="ml-6 border-l-2 border-gray-100 pl-6 space-y-6">
          <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">举一反三变式训练</h4>
          ${q.variations.map((v, vidx) => `
            <div class="mb-6">
              <div class="text-xs font-bold mb-2">变式 ${idx + 1}-${vidx + 1}</div>
              <div class="text-base font-serif mb-2">${v.content}</div>
              ${v.options ? `
                 <div class="grid grid-cols-2 gap-2 mb-2">
                   ${v.options.map((o, oi) => `
                     <div class="text-xs flex gap-1">
                       <span class="font-bold">${String.fromCharCode(65 + oi)}.</span>
                       <span>${o}</span>
                     </div>
                   `).join('')}
                 </div>
              ` : ''}
              <div class="bg-gray-50 p-2 text-[10px] border-t border-gray-100 mt-2">
                <span class="font-bold">答案:</span> ${v.answer} | <span class="font-bold">易错点:</span> ${v.explanation}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <hr class="my-8 border-gray-300" />
    `;
    qSection.innerHTML = html;
    content.appendChild(qSection);
  });

  printDiv.appendChild(content);

  // Trigger print
  window.print();
}
