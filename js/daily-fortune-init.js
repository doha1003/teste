// Initialize year dropdown
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    const yearSelect = document.getElementById('birthYear');
    if (yearSelect && yearSelect.options.length <= 1) {
      yearSelect.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '연도 선택';
      yearSelect.appendChild(defaultOption);

      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 1920; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '년';
        yearSelect.appendChild(option);
      }
      
    }
  }, 100);
});
