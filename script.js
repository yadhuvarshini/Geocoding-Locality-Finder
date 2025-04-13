document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('dynamicForm');
    const submitButton = document.getElementById('submitButton');
    const responsePre = document.getElementById('response');
    const placesContainer = document.getElementById('places-container');
    const API_KEY = '37912578b4464f36a6f2f17ce17738e2'; // Replace with your actual Geoapify API key
  
    // Load options from CSV
    fetch('data.csv')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(data => {
        const rows = data.split('\n').slice(1);
        rows.forEach(row => {
          const columns = row.split(',');
          if (columns.length >= 2) {
            const name = columns[0].trim();
            const pincode = columns[1].trim();
            const option = document.createElement('option');
            option.value = `${name},${pincode}`;
            option.textContent = `${pincode} - ${name}`;
            select.appendChild(option);
          }
        });
      })
      .catch(error => console.error('Error loading the CSV file:', error));
  
    form.addEventListener('submit', async (event) => {
      const select = document.getElementById('dynamicSelect');
      clear()
      event.preventDefault();
    //   submitButton.disabled = true;
      responsePre.textContent = '';
      placesContainer.innerHTML = '';
  
      const selectedValue = select.value;
      if (!selectedValue) {
        alert('Please select an option.');
        submitButton.disabled = false;
        return;
      }
  
      const [area, pincode] = selectedValue.split(',');
      const city = 'Chennai';
      const country = 'India';
      const state = 'Tamil Nadu';
  
      try {
        // Geocoding API request with structured parameters
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?postcode=${encodeURIComponent(pincode)}&city=${encodeURIComponent(area)}%20%2C%20${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&apiKey=${API_KEY}`;
        // https://api.geoapify.com/v1/geocode/search?postcode=600020&city=Adyar%20%2C%20Chennai&state=Tamil%20Nadu&country=India&format=json&apiKey=YOUR_API_KEY

        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeResult = await geocodeResponse.json();
  
        if (geocodeResult.features && geocodeResult.features.length > 0) {
          const feature = geocodeResult.features[0];
          const lat = feature.geometry.coordinates[1];
          const lon = feature.geometry.coordinates[0];
          const place_id = feature.properties.place_id;
          console.log('Place ID:', place_id);
            console.log('Geocoding Result:', geocodeResult);
          const bbox = feature.bbox;

  
          responsePre.textContent = `Latitude: ${lat}, Longitude: ${lon}`;
  
          if (bbox && bbox.length === 4) {
            const [minLon, minLat, maxLon, maxLat] = bbox;
            console.log('Bounding Box:', bbox);
  
            // Places API request within bounding box
            const placesUrl = `https://api.geoapify.com/v2/places?categories=populated_place&filter=place:${place_id}&bias=proximity:${lon},${lat}&limit=40&apiKey=${API_KEY}`;
            console.log('Places URL:', placesUrl);
            const placesResponse = await fetch(placesUrl);
            const placesResult = await placesResponse.json();
  
            if (placesResult.features && placesResult.features.length > 0) {
              const table = document.createElement('table');
              const header = table.insertRow();
              header.innerHTML = '<th>Name</th><th>Locality</th><th>Latitude</th><th>Longitude</th>';
  
              placesResult.features.forEach(place => {
                const row = table.insertRow();
                const name = place.properties.name || 'N/A';
                const locality = place.properties.formatted || 'N/A';
                const latitude = place.geometry.coordinates[1];
                const longitude = place.geometry.coordinates[0];
                row.innerHTML = `
                  <td>${name}</td>
                  <td>${locality}</td>
                  <td>${latitude}</td>
                  <td>${longitude}</td>
                `;
              });
  
              placesContainer.appendChild(table);
            } else {
              placesContainer.innerHTML = '<p>No populated places found in this area.</p>';
            }
          } else {
            placesContainer.innerHTML = '<p>Bounding box not available for this location.</p>';
          }
        } else {
          responsePre.textContent = 'No geocoding results found.';
        }
      } catch (error) {
        console.error('Error:', error);
        responsePre.textContent = 'An error occurred during the process.';
      }
    });
  });
  
