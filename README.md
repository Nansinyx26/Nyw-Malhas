# NYW Malhas - Catálogo Digital e Pedidos

Sistema de catálogo digital e processamento de pedidos via WhatsApp para a NYW Malhas, focado em alta performance, design moderno (Dark Theme) e facilidade de uso mobile.

## 🚀 Funcionalidades

- **Design Responsivo e Moderno**: Tema escuro (Dark Glassmorphism) com navegação fluida app-like.
- **Catálogo de Produtos**: Páginas detalhadas para Malha PV, PP, Piquet, Helanca e Algodão.
- **Carrinho e Checkout**: Fluxo de compra simplificado que finaliza o pedido diretamente no WhatsApp da loja.
- **Calculadora de Frete Inteligente**: 
  - Matriz de preços realista baseada em peso e estado (UF) de origem SP.
  - Comparativo automático entre PAC e SEDEX.
  - Aviso de estimativa de prazo e variações.
- **Autopreenchimento de Endereço**: Integração com ViaCEP para preencher rua, bairro e cidade automaticamente.

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
- **Framework CSS**: Bootstrap 5.3.
- **Ícones**: FontAwesome.
- **APIs**: ViaCEP (para consulta de endereços).

## 📂 Estrutura do Projeto

- `/css`: Estilos globais e componentes (Dark Theme, Glass, Responsividade).
- `/js`: Lógica do sistema.
  - `order-manager.js`: Gerenciamento do modal de pedidos e integração com WhatsApp.
  - `checkout.js`: Lógica da página de finalização e calculadora de frete prévia.
  - `shipping-rates.js`: Matriz centralizada de preços e prazos de frete.
  - `navigation.js`: Controle de menus e navegação mobile.
- `/paginas`: Páginas individuais de cada produto.
- `index.html`: Página inicial (Vitrine).
- `checkout.html`: Página de finalização de compra.

## 📦 Instalação e Uso

1. Clone o repositório:
   ```bash
   git clone https://github.com/Nansinyx26/Nyw-Malhas.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. Navegue pelos produtos, simule fretes e teste o fechamento de pedidos (o link do WhatsApp abrirá com a mensagem formatada).

---
**Status**: 🟢 Concluído e Funcional (v1.0)
