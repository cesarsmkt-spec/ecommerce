# 🚀 Guia de Integração Supabase - Dú Cervejaria

## 📋 Pré-requisitos
- Conta no Supabase (https://supabase.com)
- Projeto criado no Supabase

## 🔧 Passo a Passo de Configuração

### 1️⃣ Criar as Tabelas no Supabase

1. Acesse seu projeto no Supabase: https://ifsepbolbrpzrvviighx.supabase.co
2. Vá em **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie TODO o conteúdo do arquivo `supabase-schema.sql`
5. Cole no editor SQL
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a confirmação de sucesso

### 2️⃣ Verificar as Tabelas Criadas

Vá em **Table Editor** e verifique se as seguintes tabelas foram criadas:
- ✅ `products` - Produtos
- ✅ `categories` - Categorias
- ✅ `neighborhoods` - Bairros/Entregas
- ✅ `orders` - Pedidos
- ✅ `settings` - Configurações

### 3️⃣ Verificar as Credenciais

As credenciais já estão configuradas em `supabase-config.js`:
```javascript
SUPABASE_URL: https://ifsepbolbrpzrvviighx.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** Nunca compartilhe a `SERVICE_ROLE_KEY` publicamente!

## 🔄 Migração de Dados do LocalStorage

### Opção A: Migração Manual (Recomendado para poucos dados)

1. Abra o site atual no navegador
2. Abra o Console (F12)
3. Execute este código para exportar os dados:

```javascript
// Exportar produtos
const products = JSON.parse(localStorage.getItem('ducervejaria_products') || '[]');
console.log('PRODUTOS:', JSON.stringify(products, null, 2));

// Exportar bairros
const neighborhoods = JSON.parse(localStorage.getItem('ducervejaria_neighborhoods') || '[]');
console.log('BAIRROS:', JSON.stringify(neighborhoods, null, 2));

// Exportar pedidos
const orders = JSON.parse(localStorage.getItem('ducervejaria_orders') || '[]');
console.log('PEDIDOS:', JSON.stringify(orders, null, 2));
```

4. Copie os dados exibidos no console
5. No Supabase, vá em **Table Editor**
6. Selecione cada tabela e clique em **Insert** > **Insert row**
7. Cole os dados manualmente

### Opção B: Migração Automática via Script

1. Abra o Dashboard do site
2. Abra o Console (F12)
3. Cole e execute este script:

```javascript
async function migrateToSupabase() {
    console.log('🚀 Iniciando migração...');
    
    // Migrar Produtos
    const products = JSON.parse(localStorage.getItem('ducervejaria_products') || '[]');
    for (const product of products) {
        try {
            await DB.createProduct(product);
            console.log('✅ Produto migrado:', product.name);
        } catch (error) {
            console.error('❌ Erro ao migrar produto:', product.name, error);
        }
    }
    
    // Migrar Bairros
    const neighborhoods = JSON.parse(localStorage.getItem('ducervejaria_neighborhoods') || '[]');
    for (const neighborhood of neighborhoods) {
        try {
            await DB.createNeighborhood(neighborhood);
            console.log('✅ Bairro migrado:', neighborhood.name);
        } catch (error) {
            console.error('❌ Erro ao migrar bairro:', neighborhood.name, error);
        }
    }
    
    // Migrar Pedidos
    const orders = JSON.parse(localStorage.getItem('ducervejaria_orders') || '[]');
    for (const order of orders) {
        try {
            await DB.createOrder(order);
            console.log('✅ Pedido migrado:', order.id);
        } catch (error) {
            console.error('❌ Erro ao migrar pedido:', order.id, error);
        }
    }
    
    // Migrar Configurações
    const whatsapp = localStorage.getItem('ducervejaria_whatsapp') || '';
    const auth = JSON.parse(localStorage.getItem('ducervejaria_admin_auth') || '{}');
    
    try {
        await DB.updateSettings({
            whatsapp: whatsapp,
            admin_user: auth.u || 'ducervejariaadmin',
            admin_pass: auth.p || 'ducervejariaadmin'
        });
        console.log('✅ Configurações migradas');
    } catch (error) {
        console.error('❌ Erro ao migrar configurações:', error);
    }
    
    console.log('🎉 Migração concluída!');
}

// Executar migração
migrateToSupabase();
```

## 📊 Estrutura das Tabelas

### Products (Produtos)
```sql
- id: BIGSERIAL (auto-incremento)
- name: TEXT (nome do produto)
- price: DECIMAL(10,2) (preço atual)
- old_price: DECIMAL(10,2) (preço antigo)
- category: TEXT (categoria)
- image: TEXT (URL da imagem)
- stock: INTEGER (estoque)
- is_best_seller: BOOLEAN (mais vendido)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Categories (Categorias)
```sql
- id: BIGSERIAL
- name: TEXT UNIQUE (nome da categoria)
- created_at: TIMESTAMP
```

### Neighborhoods (Bairros/Entregas)
```sql
- id: BIGSERIAL
- zone: TEXT (zona: Norte, Sul, etc)
- name: TEXT (nome do bairro)
- fee: DECIMAL(10,2) (taxa de entrega)
- created_at: TIMESTAMP
```

### Orders (Pedidos)
```sql
- id: BIGSERIAL
- date: TEXT (data formatada)
- customer_name: TEXT (nome do cliente)
- customer_phone: TEXT (telefone)
- address: TEXT (endereço completo)
- neighbor: TEXT (bairro)
- zone: TEXT (zona)
- items: JSONB (produtos do pedido)
- subtotal: DECIMAL(10,2)
- delivery_fee: DECIMAL(10,2)
- total: DECIMAL(10,2)
- payment_method: TEXT (forma de pagamento)
- change: JSONB (informações de troco)
- status: TEXT (status do pedido)
- created_at: TIMESTAMP
```

### Settings (Configurações)
```sql
- id: BIGSERIAL
- whatsapp: TEXT (número do WhatsApp)
- admin_user: TEXT (usuário admin)
- admin_pass: TEXT (senha admin)
- updated_at: TIMESTAMP
```

## 🔒 Segurança (RLS - Row Level Security)

As políticas de segurança já estão configuradas:
- ✅ Leitura pública para produtos, categorias e bairros
- ✅ Escrita autenticada para produtos, categorias e bairros
- ✅ Inserção pública de pedidos (para clientes)
- ✅ Leitura/exclusão autenticada de pedidos (para admin)

## 🧪 Testar a Integração

1. Abra o site no navegador
2. Abra o Console (F12)
3. Execute:

```javascript
// Testar conexão
console.log('Supabase conectado:', window.supabaseClient);

// Testar busca de produtos
DB.getProducts().then(products => {
    console.log('Produtos no banco:', products);
});

// Testar busca de categorias
DB.getCategories().then(categories => {
    console.log('Categorias no banco:', categories);
});
```

## 📝 Próximos Passos

Após a migração bem-sucedida, você pode:

1. **Remover o localStorage** (opcional):
```javascript
localStorage.removeItem('ducervejaria_products');
localStorage.removeItem('ducervejaria_categories');
localStorage.removeItem('ducervejaria_neighborhoods');
localStorage.removeItem('ducervejaria_orders');
```

2. **Configurar Backup Automático** no Supabase
3. **Adicionar autenticação de usuários** (se necessário)
4. **Configurar webhooks** para notificações

## 🆘 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Verifique sua conexão com a internet
- Verifique se o projeto Supabase está ativo

### Erro: "Row Level Security"
- Certifique-se de que as políticas RLS foram criadas
- Execute novamente o script SQL completo

### Erro: "Invalid API key"
- Verifique se a ANON_KEY está correta
- Não use a SERVICE_ROLE_KEY no frontend

## 📞 Suporte

Em caso de dúvidas:
1. Consulte a documentação do Supabase: https://supabase.com/docs
2. Verifique os logs no Console do navegador
3. Verifique os logs no Supabase Dashboard > Logs

---

**Desenvolvido para Dú Cervejaria** 🍺
