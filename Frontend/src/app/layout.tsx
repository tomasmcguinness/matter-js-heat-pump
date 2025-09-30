import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavbarBrand from 'react-bootstrap/NavbarBrand';
import NavLink from 'react-bootstrap/NavLink';
import '../app/global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" />
      </head>
      <body>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <NavbarBrand href="/">Heat Pump</NavbarBrand>
            <Nav className="me-auto">
              <NavLink href="/">Home</NavLink>
            </Nav>
          </Container>
        </Navbar>
          <div style={{ padding: '25px' }}>
            {children}
          </div>
      </body>
    </html>
  )
}