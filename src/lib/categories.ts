import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'frutas-verduras', name: 'Frutas e Verduras', icon: '🥬', color: '#22c55e' },
  { id: 'carnes-frios', name: 'Carnes e Frios', icon: '🥩', color: '#ef4444' },
  { id: 'laticinios', name: 'Laticínios', icon: '🧀', color: '#f59e0b' },
  { id: 'padaria', name: 'Padaria', icon: '🍞', color: '#d97706' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤', color: '#3b82f6' },
  { id: 'limpeza', name: 'Limpeza', icon: '🧹', color: '#8b5cf6' },
  { id: 'higiene', name: 'Higiene', icon: '🧴', color: '#ec4899' },
  { id: 'mercearia', name: 'Mercearia / Secos', icon: '🫘', color: '#78716c' },
  { id: 'congelados', name: 'Congelados', icon: '🧊', color: '#06b6d4' },
  { id: 'temperos', name: 'Temperos e Molhos', icon: '🌶️', color: '#f97316' },
  { id: 'graos-cereais', name: 'Grãos e Cereais', icon: '🌾', color: '#a3a310' },
  { id: 'snacks', name: 'Snacks e Doces', icon: '🍫', color: '#b45309' },
  { id: 'pet', name: 'Pet', icon: '🐾', color: '#6366f1' },
  { id: 'outros', name: 'Outros', icon: '📦', color: '#6b7280' },
];

export function getCategoryById(id: string): Category {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryColor(id: string): string {
  return getCategoryById(id).color;
}

export function getCategoryIcon(id: string): string {
  return getCategoryById(id).icon;
}

// Auto-categorization based on common Brazilian product names
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'frutas-verduras': [
    'banana', 'maca', 'maça', 'laranja', 'limao', 'limão', 'tomate', 'cebola',
    'batata', 'cenoura', 'alface', 'abobora', 'abóbora', 'pepino', 'pimentao',
    'pimentão', 'morango', 'uva', 'melancia', 'manga', 'abacaxi', 'mamao',
    'mamão', 'couve', 'brocoli', 'brócolis', 'repolho', 'espinafre', 'alho',
    'gengibre', 'berinjela', 'abobrinha', 'cheiro verde', 'salsa', 'coentro',
    'hortalica', 'hortaliça', 'verdura', 'fruta', 'legume',
  ],
  'carnes-frios': [
    'carne', 'frango', 'peixe', 'linguica', 'linguiça', 'salsicha', 'bacon',
    'presunto', 'mortadela', 'peito', 'coxa', 'sobrecoxa', 'file', 'filé',
    'costela', 'picanha', 'alcatra', 'patinho', 'acém', 'acem', 'chester',
    'peru', 'bovina', 'suina', 'suína', 'porco', 'hamburguer', 'hambúrguer',
    'salame', 'calabresa', 'contrafile', 'contrafilé', 'maminha', 'cupim',
  ],
  'laticinios': [
    'leite', 'queijo', 'iogurte', 'manteiga', 'margarina', 'requeijao',
    'requeijão', 'creme de leite', 'nata', 'cream cheese', 'ricota',
    'mussarela', 'muçarela', 'parmesao', 'parmesão', 'cottage', 'danone',
  ],
  'padaria': [
    'pao', 'pão', 'bolo', 'biscoito', 'bolacha', 'rosca', 'torrada',
    'croissant', 'brioche', 'bisnaguinha', 'panetone',
  ],
  'bebidas': [
    'agua', 'água', 'suco', 'refrigerante', 'cerveja', 'vinho', 'coca',
    'guarana', 'guaraná', 'fanta', 'sprite', 'cha', 'chá', 'cafe', 'café',
    'energetico', 'energético', 'isotônico', 'isotonico', 'h2o', 'del valle',
  ],
  'limpeza': [
    'detergente', 'sabao', 'sabão', 'agua sanitaria', 'água sanitária',
    'desinfetante', 'alvejante', 'amaciante', 'limpador', 'esponja',
    'pano', 'saco de lixo', 'multiuso', 'lustra', 'cera', 'veja',
    'omo', 'ype', 'ypê', 'vanish', 'limpeza',
  ],
  'higiene': [
    'sabonete', 'shampoo', 'condicionador', 'creme dental', 'pasta dental',
    'escova dental', 'fio dental', 'desodorante', 'papel higienico',
    'papel higiênico', 'absorvente', 'cotonete', 'algodao', 'algodão',
    'protetor solar', 'hidratante',
  ],
  'mercearia': [
    'arroz', 'feijao', 'feijão', 'macarrao', 'macarrão', 'oleo', 'óleo',
    'azeite', 'vinagre', 'sal', 'acucar', 'açúcar', 'farinha', 'amido',
    'fuba', 'fubá', 'polvilho', 'aveia', 'maisena', 'canjica',
    'milho', 'ervilha', 'lentilha', 'grao', 'grão',
  ],
  'congelados': [
    'congelado', 'sorvete', 'pizza congelada', 'lasanha', 'nuggets',
    'empanado', 'hamburguer congelado', 'polpa', 'açaí', 'acai',
  ],
  'temperos': [
    'tempero', 'molho', 'ketchup', 'mostarda', 'maionese', 'shoyu',
    'pimenta', 'oregano', 'orégano', 'canela', 'cominho', 'colorau',
    'sazon', 'caldo knorr', 'caldo maggi', 'extrato de tomate',
    'massa de tomate', 'catchup',
  ],
  'graos-cereais': [
    'cereal', 'granola', 'sucrilhos', 'musli', 'chia', 'linhaca',
    'linhaça', 'quinoa', 'amendoim', 'castanha', 'nozes', 'semente',
  ],
  'snacks': [
    'chocolate', 'bala', 'chiclete', 'salgadinho', 'batata chips',
    'pipoca', 'amendoim', 'paçoca', 'pacoca', 'doce', 'geleia',
    'nutella', 'wafer', 'cookie',
  ],
  'pet': [
    'racao', 'ração', 'petisco', 'areia gato', 'sachê', 'sache',
  ],
};

export function autoCategorizeName(itemName: string): string {
  const normalized = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const itemNormalized = itemName.toLowerCase();

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const keyNormalized = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes(keyNormalized) || itemNormalized.includes(keyword)) {
        return categoryId;
      }
    }
  }

  return 'outros';
}
