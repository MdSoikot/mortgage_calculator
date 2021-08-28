import {
  Card,
  Grid,
  FormControl,
  FilledInput,
  InputAdornment,
  Slider,
  Button,
  TextField,
  MenuItem,
  AppBar,
  Tab,
  Typography,
  Box,
  Tabs,
} from "@material-ui/core";
import home from "../Assets/images/home.png";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Chart from "react-apexcharts";
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    "aria-controls": `wrapped-tabpanel-${index}`,
  };
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Main = () => {
  const [homeOwnerInsurance, setHomeOwnerInsurance] = useState({
    insurance: 100,
  });
  const [hoaFees, sethoaFees] = useState({
    hoafees: 100,
  });
  const [homePriceSliderVal, sethomePriceSliderVal] = useState(200000);
  const [years, setYears] = useState({
    years: 30,
  });
  const [item, setItem] = useState("one");
  const [alert, setAlert] = useState({
    open: false,
    msg: "",
  });
  const inputValue = (e) => e.target.value;
  const [homePrice, setHomePrice] = useState({ amount: 200000 });
  const [downpaymentpercent, setDownpaymentpercent] = useState({
    percent: 20,
  });
  const [downPayment, setDownPayment] = useState({
    amount: (homePrice.amount * downpaymentpercent.percent) / 100,
  });

  const [interestRate, setIntereseRate] = useState({
    value: 2,
  });

  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(
    interestRate.value
      ? monthlyPaymentByInterest(interestRate.value)
      : monthlyPaymentWithoutInteresRate()
  );

  const [monthlySliderVal, setMonthlySliderVal] = useState(
    interestRate.value
      ? monthlyPaymentByInterest(interestRate.value)
      : monthlyPaymentWithoutInteresRate()
  );

  const monthlySliderMax = 20000;

  const [chartData, setChartData] = useState({
    series: [
      Math.round(
        totalMonthlyPayment - (homeOwnerInsurance.insurance + hoaFees.hoafees)
      ),
      homeOwnerInsurance.insurance,
      hoaFees.hoafees,
    ],
    options: {
      labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
      plotOptions: {},
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  const handleClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlert(false);
  };

  const handleTabChange = (e, newValue) => {
    setItem(newValue);
  };

  const handleDownPaymentChange = (prop) => (e) => {
    if (inputValue(e) <= homePrice.amount) {
      if (Number(inputValue(e)) >= 0) {
        setDownPayment({ ...downPayment, [prop]: inputValue(e) });
        const newPaymentPercent = { ...downpaymentpercent };
        newPaymentPercent.percent = (inputValue(e) * 100) / homePrice.amount;
        setDownpaymentpercent(newPaymentPercent);
      }
    } else {
      setAlert({ open: true, msg: "Down payment can't exceed home price !" });
    }
  };

  const handleDownPaymentPercentage = (prop) => (e) => {
    if (inputValue(e) <= 100 && Number(inputValue(e)) >= 0) {
      setDownpaymentpercent({
        ...downpaymentpercent,
        [prop]: inputValue(e),
      });
      const newDownPayment = { ...downPayment };
      newDownPayment.amount = (homePrice.amount * inputValue(e)) / 100;

      setDownPayment(newDownPayment);
    }
  };

  const handleHomePriceChange = (prop) => (e) => {
    if (Number(inputValue(e)) >= 0) {
      setHomePrice({ ...homePrice, [prop]: inputValue(e) });
      sethomePriceSliderVal(inputValue(e));

      const newDownPayment = { ...downPayment };
      newDownPayment.amount =
        (inputValue(e) * downpaymentpercent.percent) / 100;
      setDownPayment(newDownPayment);
    }
  };
  const handleHomeOwnerInsurance = (e) => {
    const value = Number(e.target.value);
    if (Number(value) >= 0) {
      setHomeOwnerInsurance((prevState) => ({
        ...prevState,
        [e.target.name]: value,
      }));
    }
  };
  const handleHoaFees = (e) => {
    const value = Number(e.target.value);
    if (Number(value) >= 0) {
      sethoaFees((prevState) => ({
        ...prevState,
        [e.target.name]: value,
      }));
    }
  };

  function monthlyPaymentWithoutInteresRate() {
    const principal = homePrice.amount - downPayment.amount;
    const numberOfYears = years.years * 12;
    const InsuranceValue = homeOwnerInsurance.insurance;
    const hoaFeesValue = hoaFees.hoafees;
    return principal / numberOfYears + InsuranceValue + hoaFeesValue;
  }

  function monthlyPaymentByInterest(interestRateParam) {
    const principal = homePrice.amount - downPayment.amount;
    const numberOfYears = years.years * 12;
    let monthlyInterest = 0;
    if (Number.isInteger(interestRateParam)) {
      monthlyInterest = interestRateParam / 1200;
    }

    const PaymentByInterest =
      (principal *
        (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfYears))) /
      (Math.pow(1 + monthlyInterest, numberOfYears) - 1);
    const InsuranceValue = homeOwnerInsurance.insurance;
    const hoaFeesValue = hoaFees.hoafees;
    return PaymentByInterest + InsuranceValue + hoaFeesValue;
  }

  function homePriceByMonthlyPaymentWithInterest(monthlyPaymentParam) {
    const numberOfYears = years.years * 12;
    const monthlyInterest = interestRate.value / 1200;
    const calc = Math.pow(1 + monthlyInterest, numberOfYears);
    const principalByMonthlyPayment =
      (monthlyPaymentParam * (calc - 1)) / (monthlyInterest * calc);
    return principalByMonthlyPayment;
  }

  function homePriceByMonthlyPaymentWithoutInterest(monthlyPaymentParam) {
    return monthlyPaymentParam * years.years;
  }

  const handleIntereseRate =
    (prop) =>
    ({ target: { value } }) => {
      if (Number(value) <= 100 || value === "") {
        setIntereseRate({ ...interestRate, [prop]: Number(value) });
        if (Number(value) >= 0 || Number(value) <= 100) {
          setTotalMonthlyPayment(
            interestRate.value
              ? monthlyPaymentByInterest(interestRate.value)
              : monthlyPaymentWithoutInteresRate()
          );
        }
      }
    };

  const handleYears = (e) => {
    setYears((prevState) => ({
      ...prevState,
      [e.target.name]: inputValue(e),
    }));
    setTotalMonthlyPayment(
      interestRate.value
        ? monthlyPaymentByInterest(interestRate.value)
        : monthlyPaymentWithoutInteresRate()
    );
  };

  const handleMonthlyPaymentSlider = (e, val) => {
    setTotalMonthlyPayment(val);
    setHomePrice({
      ...homePrice,
      amount: interestRate.value
        ? homePriceByMonthlyPaymentWithInterest(val)
        : homePriceByMonthlyPaymentWithoutInterest(val),
      newValue: true,
    });
    sethomePriceSliderVal(
      interestRate.value
        ? homePriceByMonthlyPaymentWithInterest(val)
        : homePriceByMonthlyPaymentWithoutInterest(val)
    );
  };

  const homePriceSliderRange = (e, val) => {
    sethomePriceSliderVal(val);
    setHomePrice((prevState) => ({
      ...prevState,
      amount: val,
      newValue: false,
    }));
    setMonthlySliderVal(
      interestRate.value
        ? monthlyPaymentByInterest(interestRate.value)
        : monthlyPaymentWithoutInteresRate()
    );
  };

  const changehomePrice = homePrice.amount;
  useEffect(() => {
    const newDownPayment = { ...downPayment };
    newDownPayment.amount =
      (homePrice.amount * downpaymentpercent.percent) / 100;

    setDownPayment(newDownPayment);
    if (!homePrice?.newValue) {
      setTotalMonthlyPayment(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
    }
    setChartData({
      ...chartData,
      series: [
        Math.round(
          (interestRate.value
            ? monthlyPaymentByInterest(interestRate.value)
            : monthlyPaymentWithoutInteresRate()) -
            (homeOwnerInsurance.insurance + hoaFees.hoafees)
        ),
        homeOwnerInsurance.insurance,
        hoaFees.hoafees,
      ],
      options: {
        labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
        plotOptions: {},
      },
    });
  }, [changehomePrice]);

  const changeDownPayment = downPayment.amount;
  useEffect(() => {
    if (!homePrice?.newValue) {
      setTotalMonthlyPayment(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
      setMonthlySliderVal(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
    }
    setChartData({
      ...chartData,
      series: [
        Math.round(
          (interestRate.value
            ? monthlyPaymentByInterest(interestRate.value)
            : monthlyPaymentWithoutInteresRate()) -
            (homeOwnerInsurance.insurance + hoaFees.hoafees)
        ),
        homeOwnerInsurance.insurance,
        hoaFees.hoafees,
      ],
      options: {
        labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
        plotOptions: {},
      },
    });
  }, [changeDownPayment]);

  const changeInterestRate = interestRate.value;
  useEffect(() => {
    if (!homePrice?.newValue) {
      setTotalMonthlyPayment(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
      setMonthlySliderVal(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
    }
    setChartData({
      ...chartData,
      series: [
        Math.round(
          (interestRate.value
            ? monthlyPaymentByInterest(interestRate.value)
            : monthlyPaymentWithoutInteresRate()) -
            (homeOwnerInsurance.insurance + hoaFees.hoafees)
        ),
        homeOwnerInsurance.insurance,
        hoaFees.hoafees,
      ],
      options: {
        labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
        plotOptions: {},
      },
    });
  }, [changeInterestRate]);

  const changeYears = years.years;
  useEffect(() => {
    setHomePrice({
      ...homePrice,
      newValue: false,
    });
    if (!homePrice?.newValue) {
      setTotalMonthlyPayment(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
      setMonthlySliderVal(
        interestRate.value
          ? monthlyPaymentByInterest(interestRate.value)
          : monthlyPaymentWithoutInteresRate()
      );
    }

    setChartData({
      ...chartData,
      series: [
        Math.round(
          (interestRate.value
            ? monthlyPaymentByInterest(interestRate.value)
            : monthlyPaymentWithoutInteresRate()) -
            (homeOwnerInsurance.insurance + hoaFees.hoafees)
        ),
        homeOwnerInsurance.insurance,
        hoaFees.hoafees,
      ],
      options: {
        labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
        plotOptions: {},
      },
    });
  }, [changeYears]);

  const changeHomeOwnerInsurance = homeOwnerInsurance.insurance;
  useEffect(() => {
    setMonthlySliderVal(
      interestRate.value
        ? monthlyPaymentByInterest(interestRate.value)
        : monthlyPaymentWithoutInteresRate()
    );
    setChartData({
      ...chartData,
      series: [
        Math.round(
          (interestRate.value
            ? monthlyPaymentByInterest(interestRate.value)
            : monthlyPaymentWithoutInteresRate()) -
            (homeOwnerInsurance.insurance + hoaFees.hoafees)
        ),
        homeOwnerInsurance.insurance,
        hoaFees.hoafees,
      ],
      options: {
        labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
        plotOptions: {},
      },
    });

    setTotalMonthlyPayment(
      interestRate.value
        ? monthlyPaymentByInterest(interestRate.value)
        : monthlyPaymentWithoutInteresRate()
    );
  }, [changeHomeOwnerInsurance]);
  const changehoaFees = hoaFees.hoafees;
  useEffect(() => {
    setTotalMonthlyPayment(
      interestRate.value
        ? monthlyPaymentByInterest(interestRate.value)
        : monthlyPaymentWithoutInteresRate()
    );

    setMonthlySliderVal(
      interestRate.value
        ? monthlyPaymentByInterest(interestRate.value)
        : monthlyPaymentWithoutInteresRate()
    );

    setChartData({
      ...chartData,
      series: [
        Math.round(
          (interestRate.value
            ? monthlyPaymentByInterest(interestRate.value)
            : monthlyPaymentWithoutInteresRate()) -
            (homeOwnerInsurance.insurance + hoaFees.hoafees)
        ),
        homeOwnerInsurance.insurance,
        hoaFees.hoafees,
      ],
      options: {
        labels: ["Principal & interest", "Homeowner's insurance", "HOA fees"],
        plotOptions: {},
      },
    });
  }, [changehoaFees]);

  return (
    <div className="main">
      <Card className="main-card">
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <div className="find-homes">
              <div className="home-img">
                <img src={home} alt="home "></img>
              </div>
              <div className="home-price-section">
                <div className="head">
                  <div className="title">Home price</div>
                </div>
                <div className="price">
                  <FormControl fullWidth variant="filled">
                    <FilledInput
                      id="home-price-amount"
                      value={Math.ceil(homePrice.amount)}
                      onChange={handleHomePriceChange("amount")}
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                    />
                  </FormControl>
                  {}
                </div>
              </div>
              <div className="home-price-progress">
                <Slider
                  aria-label="custom thumb label"
                  max={2000000}
                  min={100000}
                  onChange={homePriceSliderRange}
                  value={homePriceSliderVal}
                />
              </div>
              <div className="fine-home-btn">
                <Button variant="contained" color="primary" fullWidth onClick={()=> window.open("https://www.movoto.com/for-sale/price-0-250000/?utm_medium=Partner&utm_source=Bankrate&utm_campaign=Calculator","_blank")}>
                  Find Homes
                </Button>
              </div>

              <div className="down-payment">
                <div className="head">
                  <div className="title">Down Payment</div>
                  {/* <div className="info">i</div> */}
                </div>
                <div className="custom-value">
                  <div className="amount">
                    <FormControl variant="filled">
                      <FilledInput
                        id="down-payment-amount"
                        value={Math.ceil(downPayment.amount)}
                        onChange={handleDownPaymentChange("amount")}
                        startAdornment={
                          <InputAdornment position="start">$</InputAdornment>
                        }
                      />
                    </FormControl>{" "}
                  </div>
                  <div className="percentage">
                    <FormControl variant="filled">
                      <FilledInput
                        value={downpaymentpercent.percent}
                        id="down-payment-percent"
                        onChange={handleDownPaymentPercentage("percent")}
                        startAdornment={
                          <InputAdornment position="start">%</InputAdornment>
                        }
                      />
                    </FormControl>{" "}
                  </div>
                </div>
              </div>
              <div className="length-of-loan">
                <div className="head">
                  <div className="title">Length of values</div>
                  {/* <div className="info">i</div> */}
                </div>
                <div className="dropdown">
                  <TextField
                    id="filled-select-currency"
                    select
                    name="years"
                    onChange={handleYears}
                    variant="filled"
                    fullWidth
                    defaultValue={years.years}
                  >
                    <MenuItem value="30">30 years</MenuItem>
                    <MenuItem value="20">20 years</MenuItem>
                    <MenuItem value="10">10 years</MenuItem>
                  </TextField>
                </div>
              </div>
              <div className="interest-rate">
                <div className="head">
                  <div className="title">Interest Rate</div>
                  {/* <div className="info">i</div> */}
                </div>
                <div className="custom-value">
                  <FormControl variant="filled">
                    <FilledInput
                      fullWidth
                      // type="number"
                      value={Number(interestRate.value)}
                      id="interest-rate"
                      onChange={handleIntereseRate("value")}
                      startAdornment={
                        <InputAdornment position="start">%</InputAdornment>
                      }
                    />
                  </FormControl>{" "}
                </div>
              </div>
              <div className="homeowner-insurance">
                <div className="head">
                  <div className="title">Homeowner's insurance</div>
                </div>
                <div className="custom-value">
                  <FormControl variant="filled">
                    <FilledInput
                      name="insurance"
                      fullWidth
                      value={Number(homeOwnerInsurance.insurance)}
                      id="homeowner-insurance"
                      onChange={handleHomeOwnerInsurance}
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                    />
                  </FormControl>{" "}
                </div>
              </div>
              <div className="hoa-fees">
                <div className="head">
                  <div className="title">HOA fees</div>
                </div>
                <div className="custom-value">
                  <FormControl variant="filled">
                    <FilledInput
                      name="hoafees"
                      fullWidth
                      value={Number(hoaFees.hoafees)}
                      id="hoa-fees"
                      onChange={handleHoaFees}
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                    />
                  </FormControl>{" "}
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={9}>
            <div className="view-chart">
              <div className="monthly-payment">
                <div className="desc">
                  <span style={{fontWeight: 'bold'}}>Your estimated monthly payment</span>
                </div>
                <div className="head">
                  <div className="title">
                    <span>$</span>
                    <span>{Math.round(totalMonthlyPayment)}</span>
                  </div>
                </div>
                <div className="monthly-payment-progress">
                  <div className="home-price-progress">
                    <Slider
                      aria-label="custom thumb label"
                      min={400}
                      max={monthlySliderMax}
                      onChange={handleMonthlyPaymentSlider}
                      value={totalMonthlyPayment}
                    />
                  </div>
                  <div className="accordion">
                    <AppBar position="static">
                      <Tabs
                        value={item}
                        onChange={handleTabChange}
                        aria-label="wrapped label tabs example"
                      >
                        <Tab
                          value="one"
                          label="Payment Breakdown"
                          wrapped
                          {...a11yProps("one")}
                        />
                        {/* <Tab
                          value="two"
                          label="Authorization Schedule"
                          {...a11yProps("two")}
                        /> */}
                      </Tabs>
                    </AppBar>
                  </div>
                  <TabPanel value={item} index="one">
                    <div className="payment-breakdown">
                      <div className="pie-chart">
                        <div
                          style={{
                            position: "relative",
                            height: "250px",
                            width: "350px",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{ position: "absolute", top: 0, left: 0 }}
                          >
                            {/* <PieChart
                              width={350}
                              height={250}
                              data={chartData.data}
                              series={
                                <PieArcSeries doughnut={true} label={null} />
                              }
                            /> */}

                            <Chart
                              options={chartData.options}
                              series={chartData.series}
                              width={500}
                              height={320}
                              type="donut"
                            />
                          </div>
                          <div className="text">
                            <h2
                              style={{
                                margin: "0 0",
                                padding: 0,
                                color: "black",
                                fontSize: "30px",
                              }}
                            >
                              {Math.round(totalMonthlyPayment)}
                            </h2>
                            <span>{"Monthly Payment"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="total-payment">
                        <h3>How is my monthly payment calculated?</h3>
                        <table>
                          <tr>
                            <td className="item">
                              <div className="color-bullet-principal"></div>
                              Principal & interest
                            </td>
                            <td>
                              $
                              {Math.round(
                                totalMonthlyPayment -
                                  (homeOwnerInsurance.insurance +
                                    hoaFees.hoafees)
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="item">
                              <div className="color-bullet-insurance"></div>
                              Homeowner's insurance
                            </td>
                            <td>
                              {" "}
                              <FormControl variant="filled">
                                <FilledInput
                                  name="insurance"
                                  fullWidth
                                  value={Number(homeOwnerInsurance.insurance)}
                                  id="homeowner-insurance"
                                  onChange={handleHomeOwnerInsurance}
                                  startAdornment={
                                    <InputAdornment position="start">
                                      $
                                    </InputAdornment>
                                  }
                                />
                              </FormControl>{" "}
                            </td>
                          </tr>
                          <tr>
                            <td className="item">
                              <div className="color-bullet-hoafees"></div>HOA
                              fees
                            </td>
                            <td>
                              {" "}
                              <FormControl variant="filled">
                                <FilledInput
                                  name="hoafees"
                                  fullWidth
                                  value={Number(hoaFees.hoafees)}
                                  id="hoa-fees"
                                  onChange={handleHoaFees}
                                  startAdornment={
                                    <InputAdornment position="start">
                                      $
                                    </InputAdornment>
                                  }
                                />
                              </FormControl>{" "}
                            </td>
                          </tr>

                          <tfoot>
                            <tr>
                              <td></td>
                              <td style={{ fontWeight: "bold" }}>
                                Total monthly payment = $
                                {Math.round(totalMonthlyPayment)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                    {/* <Chart
                      options={test.options}
                      series={test.series}
                      width={500}
                      height={320}
                      type="donut"
                    /> */}
                  </TabPanel>
                  {/* <TabPanel value={item} index="two"></TabPanel> */}
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </Card>
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="warning">
          {alert.msg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Main;
