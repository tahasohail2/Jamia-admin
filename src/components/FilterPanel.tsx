import React from 'react';
import { RecordFilters } from '../types';

interface FilterPanelProps {
  filters: RecordFilters;
  onFilterChange: (filters: RecordFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const handleChange = (field: keyof RecordFilters, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: undefined,
      admissionType: undefined,
      gender: undefined,
      department: undefined,
    });
  };

  const activeFilterCount = [
    filters.admissionType,
    filters.gender,
    filters.department,
  ].filter(Boolean).length;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>فلٹرز</h3>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="admissionType" className="filter-label">
            داخلہ کی قسم
          </label>
          <select
            id="admissionType"
            className="filter-select"
            value={filters.admissionType || ''}
            onChange={(e) => handleChange('admissionType', e.target.value)}
          >
            <option value="">سب</option>
            <option value="نیا داخلہ">نیا داخلہ</option>
            <option value="پہلے سے زیر تعلیم">پہلے سے زیر تعلیم</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="gender" className="filter-label">
            جنس
          </label>
          <select
            id="gender"
            className="filter-select"
            value={filters.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="">سب</option>
            <option value="طالب">طالب</option>
            <option value="طالبہ">طالبہ</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="department" className="filter-label">
            شعبہ
          </label>
          <select
            id="department"
            className="filter-select"
            value={filters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
          >
            <option value="">سب</option>
            <option value="حفظ">حفظ</option>
            <option value="تجوید">تجوید</option>
            <option value="درس نظامی / عالمہ فاضلہ">درس نظامی / عالمہ فاضلہ</option>
          </select>
        </div>

        {activeFilterCount > 0 && (
          <button
            className="btn btn-clear-filters"
            onClick={handleClearFilters}
          >
            فلٹرز صاف کریں
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
