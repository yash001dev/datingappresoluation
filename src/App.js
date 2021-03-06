/* eslint-disable no-unused-vars */
// import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";

import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
// import Pie from "./charts/pie";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import PolarChart from "./charts/polar";
import PieChart from "./charts/pie";
import RadarChart from "./charts/radar";
import { BarChart } from "./charts/bar";
// import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [revenueData, setRevenueData] = useState({});
  const [topFemaleArea, setTopFemaleArea] = useState({});
  const [topMaleArea, setTopMaleArea] = useState({});
  const [topFemaleRevenue, setTopFemaleRevenue] = useState({});
  const [compareData, setCompareData] = useState({});
  const [isRender, setIsRender] = useState(false);

  const polyRef = useRef();
  let tempData = {
    labels: [],
    datasets: [{}],
  };

  const {
    isLoading: isLoading2,
    error: error2,
    data: data2,
  } = useQuery(
    "userData",
    () => axios.get("https://kyupid-api.vercel.app/api/users"),
    {
      onSuccess: (data) => {
        setIsRender(true);
      },
    }
  );

  function random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255;
    return (
      "rgba(" +
      o(r() * s) +
      "," +
      o(r() * s) +
      "," +
      o(r() * s) +
      "," +
      r().toFixed(1) +
      ")"
    );
  }

  const findAreaName = (area_id) => {
    let labelValue = _.find(data.data.features, (feature) => {
      // eslint-disable-next-line eqeqeq
      if (feature.properties.area_id == area_id) {
        return true;
      }
    });
    return labelValue.properties.name;
  };

  const returnChartDataSet = (
    dataSets,
    parameter = "pro_users",
    order = "desc",
    length = 10,
    mainLabels = "Top 10 Revenue Area",
    secondParameter,
    compareDataSet = false,
    compareParams,
    compareLabels
  ) => {
    debugger;
    let array = Object.entries(dataSets).map((key) => {
      let value = key[1];
      return { key: key[0], ...value };
    });
    let sortedArray = _.orderBy(array, parameter, order).slice(0, length);
    if (secondParameter) {
      sortedArray = _.orderBy(sortedArray, secondParameter, order);
    }

    let labels = sortedArray.map((item) => findAreaName(item.key));
    let paramData = sortedArray.map((item) => item[parameter]);
    let paramData2;
    if (compareDataSet && compareParams) {
      paramData2 = sortedArray.map((item) => item[compareParams]);
    }
    let backgroundColor = paramData.map((item) => random_rgba());
    let compileDataSet = () => {
      if (compareDataSet && compareParams) {
        // return {
        //   datasets: [
        //     {
        //       label: mainLabels,
        //       data: paramData,
        //       backgroundColor: random_rgba(),
        //     },
        //     {
        //       label: compareLabels,
        //       data: paramData2,
        //       backgroundColor: random_rgba(),
        //     },
        //   ],
        // };
        return [
          {
            label: mainLabels,
            data: paramData,
            backgroundColor: random_rgba(),
          },
          {
            label: compareLabels,
            data: paramData2,
            backgroundColor: random_rgba(),
          },
        ];
      } else {
        return [
          {
            label: mainLabels,
            data: _.cloneDeep(paramData),
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
          },
        ];
      }
    };
    return {
      labels: labels,
      datasets: compileDataSet(),
    };
  };

  useEffect(() => {
    if (data2) {
      let tempData = {};
      data2.data.users.map((value) => {
        const newLocal = tempData[value.area_id]?.male === undefined;
        const newLocal_2 = tempData[value.area_id]?.female === undefined;
        const newLocal_3 = tempData[value.area_id]?.pro_users === undefined;
        const newLocal_4 = tempData[value.area_id]?.normal_users === undefined;
        tempData[value.area_id] = {
          ...tempData[value.area_id],
          male:
            value.gender === "M"
              ? (newLocal ? 0 : tempData[value.area_id]?.male) + 1
              : tempData[value.area_id]?.male,
          female:
            value.gender === "F"
              ? (newLocal_2 ? 0 : tempData[value.area_id]?.female) + 1
              : tempData[value.area_id]?.female,
          pro_users:
            value.is_pro_user === true
              ? (newLocal_3 ? 0 : tempData[value.area_id]?.pro_users) + 1
              : tempData[value.area_id]?.pro_users,
          normal_users:
            value.is_pro_user === false
              ? (newLocal_4 ? 0 : tempData[value.area_id]?.normal_users) + 1
              : tempData[value.area_id]?.normal_users,
        };

        return null;
      });
      setCombinedData(_.clone(tempData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data2]);

  useEffect(() => {
    let tempData2 = {
      labels: [],
      datasets: [
        {
          label: "# of Revenue",
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    };
    if (data2 && isRender && combinedData) {
      data?.data?.features.map((value) => {
        let currentProperties = {};
        currentProperties = _.cloneDeep(
          combinedData[value?.properties.area_id]
        );
        tempData2 = {
          labels: [...tempData2.labels, value?.properties?.name],
          datasets: [
            {
              ...tempData2.datasets[0],
              data: [
                ...tempData2?.datasets[0]?.data,
                currentProperties?.pro_users,
              ],
              backgroundColor: [
                ...tempData2.datasets[0].backgroundColor,
                random_rgba(),
              ],
              borderColor: [
                ...tempData2.datasets[0].borderColor,
                random_rgba(),
              ],
            },
          ],
        };
        return null;
      });
    }
    setRevenueData(_.clone(tempData2));
    setTopFemaleArea(
      returnChartDataSet(
        combinedData,
        "female",
        "desc",
        10,
        "# Top 10 Female Users Area"
      )
    );
    setTopMaleArea(
      returnChartDataSet(
        combinedData,
        "male",
        "desc",
        10,
        "# Top 10 Male Users Area"
      )
    );

    setTopFemaleRevenue(
      returnChartDataSet(
        combinedData,
        "pro_users",
        "desc",
        10,
        "# Top 10 Lowest Female Users By Revenue",
        "female"
      )
    );
    setCompareData(
      returnChartDataSet(
        combinedData,
        "pro_users",
        "desc",
        10,
        "Revenue",
        "",
        true,
        "male",
        "Male"
      )
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedData, data?.data?.features, data2, isRender]);

  return (
    <div className="App">
      <div class="jumbotron">
        <h1 class="display-4 text-center">Welcome to Dating App Resolution</h1>
        <p class="lead text-center">Learn from insight.</p>
      </div>

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

          currentProperties = _.cloneDeep(
            combinedData[value?.properties.area_id]
          );
          // tempData = {
          //   ...tempData,
          //   labels: [...tempData?.labels, value?.properties.area_name],
          //   datasets: [
          //     ...tempData.datasets,
          //     {
          //       label: "# of Revenue",
          //       data: [
          //         ...tempData.datasets[0].data,
          //         currentProperties?.revenue,
          //       ],
          //       backgroundColor: [
          //         ...tempData.datasets[0].backgroundColor,
          //         random_rgba(),
          //       ],
          //       borderColor: [
          //         ...tempData.datasets[0].borderColor,
          //         random_rgba(),
          //       ],
          //       borderWidth: 1,
          //     },
          //   ],
          // };

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
      <div className="container mb-5">
        <h1 className="display-1 py-4">Charts</h1>
        {revenueData?.labels?.length > 0 && (
          <div className="row">
            <div className="display-4">1. Revenue by Area</div>{" "}
            <PolarChart data={revenueData} />
          </div>
        )}
        <div className="row my-5">
          {topFemaleArea?.labels?.length > 0 && (
            <div className="col-12 col-md-6">
              <h2 className="display-6 text-center">
                2. Top 10 Most Female User Area
              </h2>
              <PieChart data={topFemaleArea} />
            </div>
          )}
          {topMaleArea?.labels?.length > 0 && (
            <div className="col-12 col-md-6">
              <h2 className="display-6 text-center">
                3. Top 10 Most Male User Area
              </h2>
              <PieChart data={topMaleArea} />
            </div>
          )}
        </div>

        {topFemaleRevenue?.labels?.length > 0 && (
          <div className="row">
            <div className="display-4 text-center">
              4. Top 10 Female User Area By Revenue
            </div>{" "}
            <RadarChart data={topFemaleRevenue} />
          </div>
        )}

        {compareData?.labels?.length > 0 && (
          <div className="row">
            <div className="display-4 text-center">
              5. Top 10 Revenue v/s Male
            </div>{" "}
            <BarChart data={compareData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
