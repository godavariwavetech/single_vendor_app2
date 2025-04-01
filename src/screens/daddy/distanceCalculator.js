const toRad = (value) => (value * Math.PI) / 180;

 export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    console.log(lat1,lon1,lat2,lon2,"+++++++++++++++BNBNCBCNBCNB")
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  console.log(R*c,"+++++++++++++++++++++++++++++++KM DISTANCE")
  return R * c; // Distance in km
};

// Example usage
// console.log(haversineDistance(40.7128, -74.0060, 34.0522, -118.2437) + ' km')