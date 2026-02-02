# 🍺 Dú Cervejaria - E-commerce Delivery

Sistema completo de e-commerce para delivery de bebidas com dashboard administrativo e integração com Supabase.

## 🚀 Funcionalidades

### 🛒 **Site (Frontend)**
- ✅ Catálogo de produtos com categorias
- ✅ Sistema de busca em tempo real
- ✅ Carrinho de compras dinâmico
- ✅ Seções de ofertas (Ofertas do Dia + Ofertas Imperdíveis)
- ✅ Checkout integrado com WhatsApp
- ✅ Cálculo automático de frete por bairro
- ✅ Sistema de troco para pagamento em dinheiro
- ✅ Design responsivo (Mobile, Tablet, Desktop)
- ✅ Animações e transições suaves

### 💼 **Dashboard Administrativo**
- ✅ Gestão completa de produtos (CRUD)
- ✅ Gerenciamento de categorias
- ✅ Controle de estoque
- ✅ Configuração de zonas de entrega e taxas
- ✅ Histórico de pedidos com detalhes
- ✅ Visualização detalhada de pedidos (modal)
- ✅ Relatórios de vendas
- ✅ Configurações de WhatsApp
- ✅ Alteração de credenciais de admin
- ✅ Campo de sugestões para desenvolvedor
- ✅ Menu mobile responsivo

### 🗄️ **Banco de Dados (Supabase)**
- ✅ PostgreSQL na nuvem
- ✅ Row Level Security (RLS)
- ✅ Backup automático
- ✅ API REST gerada automaticamente
- ✅ Realtime subscriptions (opcional)

## 📦 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Supabase (PostgreSQL + API REST)
- **Integração:** WhatsApp Business API
- **Hospedagem:** Compatível com Vercel, Netlify, GitHub Pages
- **Ícones:** Font Awesome 6.4
- **Fontes:** Google Fonts (Roboto)

## 🔧 Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone https://github.com/cesarsmkt-spec/ecommerce.git
cd ecommerce
```

### 2. Configure o Supabase

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o arquivo `supabase-schema.sql`
4. Copie suas credenciais (URL e ANON_KEY)
5. Atualize o arquivo `supabase-config.js` com suas credenciais

**Guia completo:** Veja `SUPABASE_SETUP.md`

### 3. Abra o Site

Você pode abrir diretamente os arquivos HTML no navegador ou usar um servidor local:

```bash
# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js (npx)
npx serve

# Opção 3: VS Code Live Server
# Instale a extensão "Live Server" e clique com botão direito em index.html
```

Acesse: `http://localhost:8000`

## 📂 Estrutura de Arquivos

```
ecommerce/
├── index.html                    # Página principal do site
├── dashboard.html                # Painel administrativo
├── style.css                     # Estilos do site
├── responsive.css                # Media queries do site
├── dashboard.css                 # Estilos do dashboard
├── dashboard-responsive.css      # Media queries do dashboard
├── script.js                     # Lógica do site
├── dashboard.js                  # Lógica do dashboard
├── products.js                   # Dados iniciais de produtos
├── supabase-config.js           # Configuração do Supabase
├── supabase-schema.sql          # Schema do banco de dados
├── SUPABASE_SETUP.md            # Guia de setup do Supabase
├── README.md                     # Este arquivo
├── logo.jpg                      # Logo da empresa
└── .git/                         # Controle de versão Git
```

## 🎨 Personalização

### Cores do Site
Edite as variáveis CSS em `style.css`:
```css
:root {
    --primary-color: #009432;    /* Verde principal */
    --secondary-color: #FFD700;  /* Dourado */
    --accent-color: #D32F2F;     /* Vermelho (ofertas) */
}
```

### Logo
Substitua o arquivo `logo.jpg` pela logo da sua empresa.

### WhatsApp
Configure o número no Dashboard > Configurações ou diretamente no Supabase na tabela `settings`.

## 🔐 Acesso ao Dashboard

**URL:** `dashboard.html`

**Credenciais padrão:**
- Usuário: `ducervejariaadmin`
- Senha: `ducervejariaadmin`

⚠️ **IMPORTANTE:** Altere as credenciais após o primeiro acesso em Configurações!

## 📱 Responsividade

O site é totalmente responsivo com breakpoints para:
- 📱 Mobile Small (320px - 480px)
- 📱 Mobile Large (481px - 767px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (1025px - 1439px)
- 🖥️ Large Desktop (1440px+)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
1. Arraste a pasta do projeto para https://app.netlify.com/drop
2. Ou conecte o repositório GitHub

### GitHub Pages
1. Vá em Settings > Pages
2. Selecione a branch `main`
3. Clique em Save

## 🔄 Migração de Dados

Se você já tem dados no localStorage, siga o guia em `SUPABASE_SETUP.md` para migrar para o Supabase.

## 📊 Funcionalidades Futuras (Roadmap)

- [ ] Sistema de cupons de desconto
- [ ] Programa de fidelidade
- [ ] Notificações push
- [ ] Chat ao vivo
- [ ] Integração com Mercado Pago
- [ ] App mobile (React Native)
- [ ] Sistema de avaliações de produtos
- [ ] Rastreamento de entrega em tempo real

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email:** ducervejaria@example.com
- **WhatsApp:** Configurável no dashboard
- **GitHub Issues:** https://github.com/cesarsmkt-spec/ecommerce/issues

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para Dú Cervejaria

---

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**
