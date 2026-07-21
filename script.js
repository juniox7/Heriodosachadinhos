// Substitua pelo seu número de WhatsApp com DDD
const WHATSAPP_NUMBER = "5519988479061"; 

// Nomes bonitos para as categorias
const CATEGORY_NAMES = {
    'menino': 'Menino',
    'menina': 'Menina',
    'cha_revelacao': 'Chá Revelação'
};

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const galleryGrid = document.getElementById('gallery-grid');
    const emptyState = document.getElementById('empty-state');
    const floatWhatsapp = document.getElementById('float-whatsapp');

    // Atualiza o link do WhatsApp Flutuante com o número correto
    floatWhatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá!%20Gostaria%20de%20ver%20mais%20informações%20sobre%20as%20decorações!`;

    // Função para renderizar imagens baseada na categoria selecionada
    function renderGallery(category) {
        galleryGrid.innerHTML = ''; // Limpa a grade
        
        // catalogoData vem do arquivo data.js gerado pelo Python
        const images = catalogoData[category] || [];

        if (images.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            const categoryReadable = CATEGORY_NAMES[category];

            images.forEach(imageName => {
                const card = document.createElement('div');
                card.className = 'decor-card';
                
                // Formata o código (remove a extensão .jpg, .png) - O Python já renomeou para números
                const codigo = imageName.substring(0, imageName.lastIndexOf('.'));
                
                // Caminho da imagem
                const imagePath = `${category}/${imageName}`;
                
                // Mensagem pre-formatada para o WhatsApp ex: "queria saber + sobre o tema codigo:13 de menina"
                const whatsappText = encodeURIComponent(`queria saber + sobre o tema codigo:${codigo} de ${categoryReadable}`);
                const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

                card.innerHTML = `
                    <div class="card-image-container">
                        <img src="${imagePath}" alt="Código ${codigo}" class="card-image" loading="lazy">
                        <!-- Badge de código em cima da imagem -->
                        <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;">
                            Cód: ${codigo}
                        </div>
                    </div>
                    <div class="card-content">
                        <a href="${whatsappLink}" target="_blank" class="btn-whatsapp">
                            <i class="fa-brands fa-whatsapp"></i> Reservar Tema
                        </a>
                    </div>
                `;
                
                galleryGrid.appendChild(card);
            });
        }
    }

    // Configuração dos cliques nas abas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-tab');
            renderGallery(category);
        });
    });

    // Renderiza a primeira aba ao iniciar a página
    renderGallery('menino');
});
