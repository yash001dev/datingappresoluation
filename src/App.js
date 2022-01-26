// import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import axios from "axios";
import { useQuery } from "react-query";
// eslint-disable-next-line no-unused-vars
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const { isLoading, error, data } = useQuery("areaData", () =>
    axios.get("https://kyupid-api.vercel.app/api/areas")
  );
  const combinedData = {};

  const {
    isLoading: isLoading2,
    error: error2,
    data: data2,
  } = useQuery("userData", () =>
    axios.get("https://kyupid-api.vercel.app/api/users")
  );

  useEffect(() => {
    if (data2) {
      data2.data.users.map((value) => {
        combinedData[value.area_id] = {
          male:
            value.gender === "M" &&
            (combinedData[value.area_id]?.male == undefined
              ? 0
              : combinedData[value.area_id]?.male) + 1,
          female:
            value.gender === "F" &&
            (combinedData[value.area_id]?.female == undefined
              ? 0
              : combinedData[value.area_id]?.female) + 1,
          pro_users:
            value.is_pro_user === true &&
            (combinedData[value.area_id]?.pro_users == undefined
              ? 0
              : combinedData[value.area_id]?.pro_users) + 1,
          normal_users:
            value.is_pro_user === false &&
            (combinedData[value.area_id]?.normal_users == undefined
              ? 0
              : combinedData[value.area_id]?.normal_users) + 1,
        };
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
          const coordinates = value.geometry.coordinates[0].map((item) => [
            item[1],
            item[0],
          ]);
          return (
            <Polygon
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
                click: (e) => {},
              }}
            />
          );
        })}
        {/* <Marker position={[12.971599, 77.594566]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker> */}
      </MapContainer>
    </div>
  );
}

export default App;
