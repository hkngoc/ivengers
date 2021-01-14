import logo from '../assets/logo2.png';

const Footer = () => {
  return (
    <footer id="sticky-footer">
      <p className="text-center">© 2020 Pê Tê Giê <span><img className="logo" alt="logo" src={logo}/></span></p>
    </footer>
  );
};

export default Footer;
