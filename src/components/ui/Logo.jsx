const Logo = ({ size = 48 }) => (
  <img
    src="/mnt/user-data/uploads/1000741292.png"
    alt="Mini Muslims Nest"
    style={{ height: size, width: "auto", objectFit: "contain" }}
    onError={e => {
      e.currentTarget.style.display = "none";
      e.currentTarget.nextSibling.style.display = "block";
    }}
  />
);

export default Logo;
