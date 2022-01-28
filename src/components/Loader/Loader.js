import PropTypes from "prop-types";
import React from "react";

export default function Loader({
  inputProps = {},
  className = "",
  customSpinner,
}) {
  return (
    <div className={`spinner-container ${className}`} {...inputProps}>
      <div
        className={!customSpinner ? "spinner-dual-ring" : customSpinner}
      ></div>
    </div>
  );
}

Loader.defaultProps = {
  inputProps: {},
  customSpinner: "",
};

Loader.propTypes = {
  inputProps: PropTypes.object,
  customSpinner: PropTypes.string,
};
