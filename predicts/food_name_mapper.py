"""
Маппер для преобразования названий из модели в более понятные названия для Nutrition API
"""

# Словарь для преобразования технических названий в простые
FOOD_NAME_MAPPING = {
    # Хлеб и выпечка
    'bread-5-grain': 'multigrain bread',
    'bread-black': 'black bread',
    'bread-french-white-flour': 'french bread',
    'bread-fruit': 'fruit bread',
    'bread-grain': 'grain bread',
    'bread-half-white': 'white bread',
    'bread-meat-substitute-lettuce-sauce': 'sandwich',
    'bread-nut': 'nut bread',
    'bread-olive': 'olive bread',
    'bread-pita': 'pita bread',
    'bread-rye': 'rye bread',
    'bread-sourdough': 'sourdough bread',
    'bread-spelt': 'spelt bread',
    'bread-ticino': 'bread',
    'bread-toast': 'toast',
    'bread-white': 'white bread',
    'bread-whole-wheat': 'whole wheat bread',
    'bread-wholemeal': 'wholemeal bread',
    'bread-wholemeal-toast': 'wholemeal toast',
    'braided-white-loaf': 'white bread',

    # Овощи
    'beetroot-raw': 'raw beetroot',
    'beetroot-steamed-without-addition-of-salt': 'steamed beetroot',
    'bell-pepper-red-raw': 'red bell pepper',
    'bell-pepper-red-stewed-without-addition-of-fat-without-addition-of-salt': 'stewed red bell pepper',
    'carrot-raw': 'raw carrot',
    'carrot-steamed-without-addition-of-salt': 'steamed carrot',
    'green-bean-steamed-without-addition-of-salt': 'steamed green beans',
    'mushroom-average-stewed-without-addition-of-fat-without-addition-of-salt': 'stewed mushrooms',
    'savoy-cabbage-steamed-without-addition-of-salt': 'steamed cabbage',
    'spinach-raw': 'raw spinach',
    'spinach-steamed-without-addition-of-salt': 'steamed spinach',
    'tomato-raw': 'raw tomato',
    'tomato-stewed-without-addition-of-fat-without-addition-of-salt': 'stewed tomato',
    'zucchini-stewed-without-addition-of-fat-without-addition-of-salt': 'stewed zucchini',

    # Мясо
    'beef-cut-into-stripes-only-meat': 'beef strips',
    'beef-filet': 'beef fillet',
    'beef-minced-only-meat': 'minced beef',
    'beef-roast': 'roast beef',
    'beef-sirloin-steak': 'sirloin steak',
    'chicken-cut-into-stripes-only-meat': 'chicken strips',
    'chicken-curry-cream-coconut-milk-curry-spices-paste': 'chicken curry',
    'cordon-bleu-from-pork-schnitzel-fried': 'cordon bleu',
    'goat-average-raw': 'raw goat meat',
    'smoked-cooked-sausage-of-pork-and-beef-meat-sausag': 'smoked sausage',

    # Бекон
    'bacon-cooking': 'cooked bacon',
    'bacon-frying': 'fried bacon',
    'bacon-raw': 'raw bacon',

    # Сыры
    'blue-mould-cheese': 'blue cheese',
    'cheese-for-raclette': 'raclette cheese',
    'curds-natural-with-at-most-10-fidm': 'cottage cheese',
    'emmental-cheese': 'emmental cheese',
    'faux-mage-cashew-vegan-chers': 'vegan cheese',
    'goat-cheese-soft': 'soft goat cheese',
    'greek-yaourt-yahourt-yogourt-ou-yoghourt': 'greek yogurt',
    'hard-cheese': 'hard cheese',
    'semi-hard-cheese': 'semi-hard cheese',
    'soft-cheese': 'soft cheese',
    'soya-yaourt-yahourt-yogourt-ou-yoghourt': 'soy yogurt',
    'yaourt-yahourt-yogourt-ou-yoghourt-natural': 'natural yogurt',

    # Напитки
    'aperitif-with-alcohol-aperol-spritz': 'aperol spritz',
    'chocolate-milk-chocolate-drink': 'chocolate milk',
    'coca-cola': 'coca cola',
    'coca-cola-zero': 'coke zero',
    'coffee-decaffeinated': 'decaf coffee',
    'coffee-with-caffeine': 'coffee',
    'espresso-with-caffeine': 'espresso',
    'glucose-drink-50g': 'glucose drink',
    'juice-apple': 'apple juice',
    'juice-multifruit': 'multifruit juice',
    'juice-orange': 'orange juice',
    'kefir-drink': 'kefir',
    'latte-macchiato-with-caffeine': 'latte macchiato',
    'light-beer': 'light beer',
    'oat-milk': 'oat milk',
    'ristretto-with-caffeine': 'ristretto',
    'soya-drink-soy-milk': 'soy milk',
    'syrup-diluted-ready-to-drink': 'syrup drink',
    'water-mineral': 'mineral water',
    'water-with-lemon-juice': 'lemon water',
    'white-coffee-with-caffeine': 'white coffee',
    'wine-red': 'red wine',
    'wine-rose': 'rose wine',
    'wine-white': 'white wine',

    # Паста
    'high-protein-pasta-made-of-lentils-peas': 'protein pasta',
    'pasta-hornli': 'pasta',
    'pasta-in-butterfly-form-farfalle': 'farfalle pasta',
    'pasta-in-conch-form': 'conch pasta',
    'pasta-linguini-parpadelle-tagliatelle': 'linguini',
    'pasta-noodles': 'noodles',
    'pasta-penne': 'penne pasta',
    'pasta-ravioli-stuffing': 'ravioli',
    'pasta-spaghetti': 'spaghetti',
    'pasta-tortelloni-stuffing': 'tortelloni',
    'pasta-twist': 'fusilli pasta',
    'pasta-wholemeal': 'wholemeal pasta',

    # Рис
    'rice-basmati': 'basmati rice',
    'rice-jasmin': 'jasmine rice',
    'rice-noodles-vermicelli': 'rice noodles',
    'rice-waffels': 'rice waffles',
    'rice-whole-grain': 'brown rice',
    'rice-wild': 'wild rice',

    # Картофель
    'baked-potato': 'baked potato',
    'country-fries': 'french fries',
    'chips-french-fries': 'french fries',
    'mashed-potatoes-prepared-with-full-fat-milk-with-butter': 'mashed potatoes',
    'potato-gnocchi': 'gnocchi',
    'potato-salad-with-mayonnaise-yogurt-dressing': 'potato salad',
    'potatoes-au-gratin-dauphinois-prepared': 'gratin potatoes',
    'potatoes-steamed': 'steamed potatoes',

    # Супы
    'soup-cream-of-vegetables': 'cream of vegetable soup',
    'soup-miso': 'miso soup',
    'soup-of-lentils-dahl-dhal': 'lentil soup',
    'soup-potato': 'potato soup',
    'soup-pumpkin': 'pumpkin soup',
    'soup-tomato': 'tomato soup',
    'soup-vegetable': 'vegetable soup',

    # Соусы
    'balsamic-salad-dressing': 'balsamic dressing',
    'balsamic-vinegar': 'balsamic vinegar',
    'bolognaise-sauce': 'bolognese sauce',
    'french-salad-dressing': 'french dressing',
    'hazelnut-chocolate-spread-nutella-ovomaltine-caotina': 'nutella',
    'italian-salad-dressing': 'italian dressing',
    'oil-vinegar-salad-dressing': 'vinaigrette',
    'sauce-carbonara': 'carbonara sauce',
    'sauce-cocktail': 'cocktail sauce',
    'sauce-cream': 'cream sauce',
    'sauce-curry': 'curry sauce',
    'sauce-mushroom': 'mushroom sauce',
    'sauce-pesto': 'pesto',
    'sauce-roast': 'gravy',
    'sauce-savoury': 'savory sauce',
    'sauce-soya': 'soy sauce',
    'sauce-sweet-salted-asian': 'sweet and sour sauce',
    'sauce-sweet-sour': 'sweet and sour sauce',
    'tartar-sauce': 'tartar sauce',
    'tomato-sauce': 'tomato sauce',

    # Фрукты
    'apricot-dried': 'dried apricots',
    'fig-dried': 'dried figs',
    'grapefruit-pomelo': 'grapefruit',
    'sugar-melon': 'melon',
    'watermelon-fresh': 'watermelon',

    # Орехи
    'brazil-nut': 'brazil nuts',
    'cashew-nut': 'cashew nuts',
    'hazelnut': 'hazelnuts',
    'pecan-nut': 'pecans',
    'pine-nuts': 'pine nuts',

    # Десерты
    'apple-crumble': 'apple crumble',
    'apple-pie': 'apple pie',
    'banana-cake': 'banana cake',
    'black-forest-tart': 'black forest cake',
    'cake-chocolate': 'chocolate cake',
    'cake-marble': 'marble cake',
    'cake-oblong': 'cake',
    'cake-salted': 'savory cake',
    'carrot-cake': 'carrot cake',
    'chocolate-mousse': 'chocolate mousse',
    'lemon-cake': 'lemon cake',
    'lemon-pie': 'lemon pie',
    'pie-apricot-baked-with-cake-dough': 'apricot pie',
    'pie-plum-baked-with-cake-dough': 'plum pie',
    'pie-rhubarb-baked-with-cake-dough': 'rhubarb pie',
    'dairy-ice-cream': 'ice cream',
    'panna-cotta': 'panna cotta',
    'vanille-cream-cooked-custard-creme-dessert': 'vanilla custard',

    # Пицца
    'french-pizza-from-alsace-baked': 'pizza',
    'pizza-margherita-baked': 'margherita pizza',
    'pizza-with-ham-baked': 'ham pizza',
    'pizza-with-ham-with-mushrooms-baked': 'ham and mushroom pizza',
    'pizza-with-vegetables-baked': 'vegetable pizza',

    # Завтраки
    'birchermuesli-prepared-no-sugar-added': 'bircher muesli',
    'corn-flakes': 'corn flakes',
    'crunch-muesli': 'crunchy muesli',
    'flakes-oat': 'oat flakes',
    'porridge-prepared-with-partially-skimmed-milk': 'porridge',

    # Салаты
    'caprese-salad-tomato-mozzarella': 'caprese salad',
    'coleslaw-chopped-without-sauce': 'coleslaw',
    'greek-salad': 'greek salad',
    'mixed-salad-chopped-without-sauce': 'mixed salad',
    'salad-lambs-ear': 'lambs lettuce',
    'salad-leaf-salad-green': 'green salad',
    'salad-rocket': 'arugula salad',
    'taboule-prepared-with-couscous': 'tabbouleh',

    # Гамбургеры и сэндвичи
    'hamburger-bread-meat-ketchup': 'hamburger',
    'hamburger-bun': 'hamburger bun',
    'sandwich-ham-cheese-and-butter': 'ham and cheese sandwich',
    'croque-monsieur': 'croque monsieur',
    'kebab-in-pita-bread': 'kebab',

    # Готовые блюда
    'cantonese-fried-rice': 'fried rice',
    'chili-con-carne-prepared': 'chili con carne',
    'curry-vegetarian': 'vegetarian curry',
    'egg-scrambled-prepared': 'scrambled eggs',
    'lasagne-meat-prepared': 'meat lasagna',
    'lasagne-vegetable-prepared': 'vegetable lasagna',
    'omelette-plain': 'plain omelette',
    'quiche-with-cheese-baked-with-puff-pastry': 'cheese quiche',
    'quiche-with-spinach-baked-with-cake-dough': 'spinach quiche',
    'risotto-with-mushrooms-cooked': 'mushroom risotto',
    'risotto-without-cheese-cooked': 'risotto',

    # Другое
    'bagel-without-filling': 'bagel',
    'biscuit-with-butter': 'butter biscuit',
    'breadcrumbs-unspiced': 'breadcrumbs',
    'buckwheat-grain-peeled': 'buckwheat',
    'buckwheat-pancake': 'buckwheat pancake',
    'butter-herb': 'herb butter',
    'butter-spread-puree-almond': 'almond butter',
    'chicken-nuggets': 'chicken nuggets',
    'chocolate-cookies': 'chocolate cookies',
    'chocolate-egg-small': 'chocolate egg',
    'chocolate-filled': 'chocolate filled',
    'corn-crisps': 'corn chips',
    'crisp-bread-wasa': 'crisp bread',
    'croissant-wholegrain': 'wholegrain croissant',
    'croissant-with-chocolate-filling': 'chocolate croissant',
    'dough-puff-pastry-shortcrust-bread-pizza-dough': 'dough',
    'dried-raisins': 'raisins',
    'fajita-bread-only': 'fajita',
    'falafel-balls': 'falafel',
    'fish-crunchies-battered': 'fish nuggets',
    'fish-fingers-breaded': 'fish fingers',
    'gluten-free-bread': 'gluten free bread',
    'gummi-bears-fruit-jellies-jelly-babies-with-fruit-essence': 'gummy bears',
    'lentils-green-du-puy-du-berry': 'lentils',
    'lye-pretzel-soft': 'soft pretzel',
    'm-m-s': 'm&ms',
    'maple-syrup-concentrate': 'maple syrup',
    'meat-terrine-pate': 'pate',
    'milk-chocolate': 'milk chocolate',
    'milk-chocolate-with-hazelnuts': 'hazelnut chocolate',
    'mix-of-dried-fruits-and-nuts': 'trail mix',
    'peanut-butter': 'peanut butter',
    'perch-fillets-lake': 'perch fillet',
    'popcorn-salted': 'salted popcorn',
    'roll-of-half-white-or-white-flour-with-large-void': 'bread roll',
    'roll-with-pieces-of-chocolate': 'chocolate roll',
    'salmon-smoked': 'smoked salmon',
    'spring-roll-fried': 'spring roll',
    'sweet-corn-canned': 'canned corn',
    'sweet-potato': 'sweet potato',
    'sweets-candies': 'candy',
    'tuna-in-oil-drained': 'tuna',
    'turnover-with-meat-small-meat-pie-empanadas': 'empanada',
    'veggie-burger': 'veggie burger',
    'white-bread-with-butter-eggs-and-milk': 'brioche',
    'wienerli-swiss-sausage': 'swiss sausage',
}


def map_food_name(model_output: str) -> str:
    """
    Преобразует название из модели в более понятное для Nutrition API

    Args:
        model_output: Название продукта из модели (например, 'beef-cut-into-stripes-only-meat')

    Returns:
        Более простое название (например, 'beef strips')
    """
    # Если есть прямой маппинг - используем его
    if model_output in FOOD_NAME_MAPPING:
        return FOOD_NAME_MAPPING[model_output]

    # Иначе просто заменяем дефисы на пробелы и возвращаем
    return model_output.replace('-', ' ')


# Пример использования
if __name__ == "__main__":
    test_names = [
        'beef-cut-into-stripes-only-meat',
        'apple',
        'pizza-margherita-baked',
        'chicken-curry-cream-coconut-milk-curry-spices-paste',
        'hamburger-bread-meat-ketchup'
    ]

    print("Примеры маппинга:")
    for name in test_names:
        print(f"{name:50} -> {map_food_name(name)}")
