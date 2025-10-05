var typed = new Typed('#element', {
  strings: ['meteors', 'their impact', 'and NASA’s solutions.'],
  typeSpeed: 100,
});

const API_KEY = "LbrK2xQAnCU26To6CkxgBH4H5YulhHUwVxHkgHik";
const API_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-10-01&end_date=2025-10-07&api_key=${API_KEY}`;

let sizeChart, distanceChart;

async function fetchMeteors() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    let meteorNames = [];
    let meteorSizes = [];
    let meteorDistances = [];

    for (let date in data.near_earth_objects) {
      data.near_earth_objects[date].forEach(meteor => {
        meteorNames.push(meteor.name);


        meteorSizes.push(meteor.estimated_diameter.meters.estimated_diameter_max);


        meteorDistances.push(
          parseFloat(meteor.close_approach_data[0].miss_distance.kilometers)
        );
      });
    }

 
    makeSizeChart(meteorNames.slice(0, 5), meteorSizes.slice(0, 5));
    makeDistanceChart(meteorNames.slice(0, 5), meteorDistances.slice(0, 5));

  } catch (error) {
    console.error("Error fetching meteors:", error);
  }
}

function makeSizeChart(names, sizes) {
  const ctx = document.getElementById('sizeChart').getContext('2d');
  if (sizeChart) sizeChart.destroy();

  sizeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: "Size (meters)",
        data: sizes,
        backgroundColor: "rgba(255, 99, 132, 0.7)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Meters" }
        }
      }
    }
  });
}

function makeDistanceChart(names, distances) {
  const ctx = document.getElementById('distanceChart').getContext('2d');
  if (distanceChart) distanceChart.destroy();

  distanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: "Distance (km)",
        data: distances,
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Kilometers" }
        }
      }
    }
  });
}




let impactChart;

function makeImpactChart(names, energies, colors) {
  const ctx = document.getElementById('impactChart').getContext('2d');
  if (impactChart) impactChart.destroy();

  impactChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: "Impact Energy (Megatons TNT)",
        data: energies,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.y} megatons TNT`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Megatons TNT" }
        }
      }
    }
  });
}

function addImpactData(meteorNames, meteorSizes, meteorVelocities, meteorDistances, hazardFlags) {
  const densities = 3000; // kg/m³ average asteroid density

  let energies = meteorSizes.map((diameter, i) => {
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * densities; // kg
    const velocity_m_s = meteorVelocities[i] * 1000; // km/s → m/s
    const energy_joules = 0.5 * mass * velocity_m_s * velocity_m_s;
    const energy_megatons = energy_joules / 4.184e15; // TNT equivalent
    return Number(energy_megatons.toFixed(2));
  });

  let colors = hazardFlags.map(flag =>
    flag ? "rgba(255, 99, 132, 0.7)" : "rgba(54, 162, 235, 0.7)"
  );

  makeImpactChart(meteorNames, energies, colors);
}

async function fetchMeteors() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    let meteorNames = [];
    let meteorSizes = [];
    let meteorDistances = [];
    let meteorVelocities = [];
    let hazardFlags = [];

    for (let date in data.near_earth_objects) {
      data.near_earth_objects[date].forEach(meteor => {
        meteorNames.push(meteor.name);

        meteorSizes.push(
          meteor.estimated_diameter.meters.estimated_diameter_max
        );

        meteorDistances.push(
          parseFloat(meteor.close_approach_data[0].miss_distance.kilometers)
        );

        meteorVelocities.push(
          parseFloat(meteor.close_approach_data[0].relative_velocity.kilometers_per_second)
        );

        hazardFlags.push(meteor.is_potentially_hazardous_asteroid);
      });
    }

    makeSizeChart(meteorNames.slice(0, 5), meteorSizes.slice(0, 5));
    makeDistanceChart(meteorNames.slice(0, 5), meteorDistances.slice(0, 5));
    addImpactData(
      meteorNames.slice(0, 5),
      meteorSizes.slice(0, 5),
      meteorVelocities.slice(0, 5),
      meteorDistances.slice(0, 5),
      hazardFlags.slice(0, 5)
    );

  } catch (error) {
    console.error("Error fetching meteors:", error);
  }
}

fetchMeteors();



