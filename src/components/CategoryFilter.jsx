/**
 * CategoryFilter.jsx - Industry / Language Category Switcher
 * Allows switching between 'All Movies', 'Tamil', and 'Hollywood'
 */

function CategoryFilter({
  categories = ['All Movies', 'Tamil', 'Hollywood'],
  selectedCategory = 'All Movies',
  onSelectCategory,
}) {
  return (
    <div className="category-filter-wrapper" role="toolbar" aria-label="Movie Category Filters">
      <span className="category-filter-label">Industry:</span>
      <div className="category-pills-list">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.toLowerCase() ||
            (selectedCategory === '' && cat === 'All Movies');

          return (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
              aria-pressed={isSelected}
            >
              {cat === 'Tamil' && '🎭 '}
              {cat === 'Hollywood' && '🎬 '}
              {cat === 'All Movies' && '🍿 '}
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;
