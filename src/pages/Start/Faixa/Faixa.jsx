import React from 'react';

export default function Faixa() {
  return (
    
    <div className=" max-w-2xl mx-auto px-4 my-10">
      
      
      <figure className="diff aspect-video  rounded-2xl shadow-2xl overflow-hidden" tabIndex={0}>
        
        
        <div className="diff-item-1" role="img" tabIndex={0}>
          <img 
            alt="Vestibular Focado" 
            src="https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp" 
            className=" h-full object-cover" 
          />
        </div>
        
        
        <div className="diff-item-2" role="img">
          <img
            alt="Vestibular Desfocado"
            src="https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp" 
            className=" h-full object-cover blur-md" 
          />
        </div>
        
        
        <div className="diff-resizer"></div>

      </figure>

    </div>
  );
}
