# NYW Malhas - Sistema de Gestão de Produtos

## 🎉 Atualização: MongoDB Atlas Integrado!

### O que mudou?

O sistema agora usa **MongoDB Atlas** (banco de dados na nuvem) ao invés de IndexedDB (armazenamento local do navegador).

### Vantagens:

✅ **Acesso de qualquer lugar** - Atualize preços do celular, tablet ou qualquer computador  
✅ **Dados sempre salvos** - Nunca mais perca dados ao limpar cache do navegador  
✅ **Controle de estoque** - Sistema rastreia quantidade disponível em kg  
✅ **Múltiplos administradores** - Várias pessoas podem gerenciar o sistema  
✅ **Sincronização em tempo real** - Mudanças aparecem instantaneamente para todos  

---

## 🚀 Como Usar

### 1. Iniciar o Servidor Backend

```bash
cd backend
npm run dev
```

O servidor iniciará em `http://localhost:5000`

### 2. Acessar o Painel Administrativo

1. Abra `admin.html` no navegador
2. Faça login:
   - **Usuário:** admin
   - **Senha:** admin123
3. Gerencie produtos, preços e informações de contato

### 3. Visualizar o Site

Abra `index.html` no navegador. Os produtos agora vêm direto do MongoDB!

---

## 📁 Estrutura do Projeto

```
Nyw-Malhas-main/
├── backend/                    # Servidor Node.js + Express
│   ├── config/
│   │   └── database.js        # Configuração MongoDB
│   ├── models/
│   │   ├── Product.js         # Schema de Produtos
│   │   └── Contact.js         # Schema de Contato
│   ├── controllers/
│   │   ├── productController.js
│   │   └── contactController.js
│   ├── routes/
│   │   ├── products.js
│   │   └── contact.js
│   ├── scripts/
│   │   └── migrate-from-indexeddb.js  # Script de migração
│   ├── .env                   # Variáveis de ambiente (NÃO COMMITAR!)
│   ├── server.js              # Servidor principal
│   └── package.json
│
├── js/
│   ├── api-client.js          # Cliente HTTP para API
│   ├── db-manager-cloud.js    # Adaptador MongoDB (novo!)
│   ├── db-manager.js          # IndexedDB (fallback)
│   ├── products-sync.js       # Sincronização de produtos
│   └── admin.js               # Lógica do painel admin
│
├── index.html                 # Página inicial
├── admin.html                 # Painel administrativo
└── paginas/                   # Páginas de produtos
```

---

## 🔧 Comandos Úteis

### Backend

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (reinicia automaticamente)
npm run dev

# Modo produção
npm start

# Migrar dados para MongoDB
npm run migrate
```

---

## 🔐 Segurança

### Arquivo `.env`

O arquivo `backend/.env` contém informações sensíveis:
- URI de conexão do MongoDB
- Chaves secretas JWT

**⚠️ NUNCA commite este arquivo no Git!** (já está no `.gitignore`)

### Alterar Senha do MongoDB

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Vá em **Database Access**
3. Edite o usuário `nanoliveira`
4. Altere a senha
5. Atualize o arquivo `.env` com a nova URI

---

## 📡 API Endpoints

### Produtos
- `GET /api/products` - Listar todos os produtos
- `GET /api/products/:id` - Buscar produto específico
- `POST /api/products` - Criar novo produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `PUT /api/products/mass-price` - Atualizar preços em massa
- `GET /api/products/stats` - Estatísticas

### Contato
- `GET /api/contact` - Obter informações
- `PUT /api/contact` - Atualizar informações

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to MongoDB"
- Verifique se a URI no `.env` está correta
- Confirme que seu IP está na whitelist do MongoDB Atlas
- Teste a conexão com `npm run migrate`

### Erro: "API Client not initialized"
- Certifique-se que o backend está rodando (`npm run dev`)
- Verifique se `api-client.js` está carregado antes de `db-manager-cloud.js`

### Admin não carrega produtos
- Abra o Console do navegador (F12)
- Verifique se há erros de CORS
- Confirme que o backend está em `http://localhost:5000`

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12 → Console)
2. Logs do servidor backend (terminal onde rodou `npm run dev`)
3. Status do MongoDB Atlas (cloud.mongodb.com)

---

## 🎯 Próximas Funcionalidades

- [ ] Sistema de pedidos
- [ ] Relatórios de vendas
- [ ] Autenticação JWT
- [ ] Upload de imagens direto
- [ ] API para WhatsApp Bot
- [ ] App mobile

---

Desenvolvido com ❤️ para NYW Malhas
