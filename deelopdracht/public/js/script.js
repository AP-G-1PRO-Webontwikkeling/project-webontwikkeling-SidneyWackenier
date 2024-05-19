fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/deelopdracht/json/dc.json')
  .then(response => response.json())
  .then(data => {
    const rarities = data.map(item => item.rarity);
    
    const cardBorders = document.getElementsByClassName('playercard');
    
    Array.from(cardBorders).forEach((cardBorder, index) => {
      const rarity = rarities[index];
      if (rarity === 'Common') {
        cardBorder.style.borderColor = 'lightgrey';
      } else if (rarity === 'Uncommon') {
        cardBorder.style.borderColor = 'green';
      } else if (rarity === 'Rare') {
        cardBorder.style.borderColor = '#0a75ad';
      } else if (rarity === 'Epic') {
        cardBorder.style.borderColor = 'purple';
      } else if (rarity === 'Legendary') {
        cardBorder.style.borderColor = 'gold';
      } else if (rarity === 'Ultra') {
        cardBorder.style.borderColor = '#c62d42';
      }
      
      console.log(rarity);
    });
  })
  .catch(error => console.error('Error fetching JSON:', error));