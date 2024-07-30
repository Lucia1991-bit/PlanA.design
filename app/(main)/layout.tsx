import NavBar from "@/components/_NavBar/NavBar";
import Footer from "@/components/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
