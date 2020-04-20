import React from 'react';
import Helmet from 'react-helmet';
import L, { latLng, divIcon } from 'leaflet';
import axios from 'axios';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';
import { array } from 'prop-types';


const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];


const IndexPage = () => {


  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    let response;

    try {
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
    } catch (e) {
      console.log(`Failed to fetch countries: ${e.message}`, e);
      return;
    }
    const { data = [] } = response;
    const hasData = Array.isArray(data) && array.length > 0;

    if (!hasData) return;

    const geoJson = {
      type: 'FeatureCollection',
      features: data.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      })
    }
    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let caseString;

        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties

        caseString = `${cases}`;

        if (cases > 1000) {
          casesString = `${casesString.slice(0, -3)}k+`
        }

        if (updated) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
        const html = `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}
                <li><strong>Deaths:</strong> ${deaths}
                <li><strong>Recovered:</strong> ${recovered}
                <li><strong>Last Updated:</strong> ${updatedFormatted}
              </ul> 
            </span>
            ${ casesString}
          </span>
          `;

        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'icon',
            html
          }),
          riseOnHover: true
        })
      }
    })
  }
  geoJsonLayers.addTo(map)
}
export default IndexPage;
