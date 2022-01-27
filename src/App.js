/* eslint-disable no-unused-vars */
// import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";

// import {
//   Chart as ChartJS,
//   RadialLinearScale,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { PolarArea } from "react-chartjs-2";

// eslint-disable-next-line no-unused-vars
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { BallTriangle } from "react-loader-spinner";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

// ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

function App() {
  const { isLoading, error, data } = useQuery("areaData", () =>
    axios.get("https://kyupid-api.vercel.app/api/areas")
  );
  const [combinedData, setCombinedData] = useState({});

  const polyRef = useRef();

  const {
    isLoading: isLoading2,
    error: error2,
    data: data2,
  } = useQuery("userData", () =>
    axios.get("https://kyupid-api.vercel.app/api/users")
  );

  useEffect(() => {
    if (data2) {
      let tempData = {};
      data2.data.users.map((value) => {
        tempData[value.area_id] = {
          ...tempData[value.area_id],
          male:
            value.gender === "M"
              ? (tempData[value.area_id]?.male == undefined
                  ? 0
                  : tempData[value.area_id]?.male) + 1
              : tempData[value.area_id]?.male,
          female:
            value.gender === "F"
              ? (tempData[value.area_id]?.female == undefined
                  ? 0
                  : tempData[value.area_id]?.female) + 1
              : tempData[value.area_id]?.female,
          pro_users:
            value.is_pro_user === true
              ? (tempData[value.area_id]?.pro_users == undefined
                  ? 0
                  : tempData[value.area_id]?.pro_users) + 1
              : tempData[value.area_id]?.pro_users,
          normal_users:
            value.is_pro_user === false
              ? (tempData[value.area_id]?.normal_users == undefined
                  ? 0
                  : tempData[value.area_id]?.normal_users) + 1
              : tempData[value.area_id]?.normal_users,
        };
        setCombinedData(_.clone(tempData));
      });
    }
  }, [data2]);

  console.log("DATA:", data);
  console.log("ERROR:", error);
  console.log("LOADING:", isLoading);

  console.log("DATA2:", data2);
  console.log("ERROR2:", error2);
  console.log("LOADING2:", isLoading2);

  return (
    <div className="App">
      <BallTriangle
        className="overlay"
        height="100"
        width="100"
        color="grey"
        ariaLabel="Loading your content"
      />
      <h1>Welcome To Dating App Resolution</h1>
      <MapContainer
        style={{ height: "80vh" }}
        zoom={11}
        center={[12.971599, 77.594566]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data?.data?.features.map((value) => {
          let currentProperties = {};
          const coordinates = value.geometry.coordinates[0].map((item) => [
            item[1],
            item[0],
          ]);

          currentProperties = combinedData[value?.properties.area_id];

          return (
            <div key={coordinates}>
              <Polygon
                ref={polyRef}
                pathOptions={{
                  fillColor: "#FD8D3C",
                  fillOpacity: 0.7,
                  weight: 2,
                  opacity: 1,
                  dashArray: 3,
                  color: "white",
                }}
                positions={coordinates}
                eventHandlers={{
                  mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.7,
                      weight: 5,
                      dashArray: "3",
                      color: "#666",
                      fillColor: "#D45962",
                    });
                  },
                  mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.7,
                      weight: 2,
                      dashArray: "3",
                      color: "white",
                      fillColor: "#FD8D3C",
                    });
                  },
                  click: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.7,
                      weight: 5,
                      dashArray: "3",
                      color: "white",
                      fillColor: "#915020",
                    });
                    layer.bindTooltip(
                      `<h2>Area Name:${value?.properties?.name}</h2>
                      <p>Female Users:${currentProperties.female}</p>
                      <p>Male Users:${currentProperties.male}</p>
                      <p>Pro Users:${currentProperties.pro_users}</p>
                      <p>Normal Users:${currentProperties.normal_users}</p>
                      `
                    );
                  },
                }}
              >
                <Marker position={coordinates[0]}>
                  <Popup>
                    <h2>Area Name: {value?.properties?.name}</h2>
                    <p>Pin Code: {value?.properties?.pin_code}</p>
                    <br />
                    (Click on orange area for more information)
                  </Popup>
                </Marker>
              </Polygon>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;
