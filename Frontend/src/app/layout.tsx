import type { Metadata } from "next";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavLink from 'react-bootstrap/NavLink';
import Navbar from 'react-bootstrap/Navbar';
import NavbarBrand from 'react-bootstrap/NavbarBrand';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" />
      </head>
      <body>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <NavbarBrand href="/">ACME Seld-M-Break HeatPump</NavbarBrand>
            <Nav className="me-auto">
              <NavLink href="/">Status</NavLink>
              {/* <NavLink href="/config">Config</NavLink> */}
            </Nav>
          </Container>
        </Navbar>
        <Container>
          <div style={{ padding: '25px' }}>
            {children}
          </div>
        </Container>
      </body>
    </html>
  );
}
