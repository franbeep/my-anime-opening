import {
  Icon,
  Button,
  Menu,
  Label,
  Grid,
  List,
  Sidebar,
  Pagination,
  Checkbox,
  Sticky,
} from "semantic-ui-react";
import { useMemo, useState } from "react";
import useBreakpoints from "../hooks/useBreakpoint";

function PaginationWrapper({ children }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const paginatedChildren = () => {
    const offset = (page - 1) * size;
    return children.slice(offset, offset + size);
  };

  const breakpoints = {
    sm: 1024,
    md: 1280,
    lg: 1920,
    xl: 2560,
    xxl: 3840,
  };
  const breakpointSize = useBreakpoints(breakpoints);

  const columnSize = useMemo(() => {
    switch (breakpointSize) {
      case "xxl":
        return 5;
      case "xl":
        return 4;
      case "lg":
        return 3;
      case "md":
        return 2;
      case "sm":
        return 1;
      default:
        return 1;
    }
  }, [breakpointSize]);

  return (
    <Grid
      columns={1}
      style={{
        margin: "1em",
        width: "100%",
      }}
    >
      <Grid.Column>
        <Grid columns={columnSize}>
          {paginatedChildren().map((anime, index) => (
            <Grid.Column key={index}>{anime}</Grid.Column>
          ))}
        </Grid>
      </Grid.Column>
      <Grid.Column>
        <Pagination
          activePage={page}
          onPageChange={(ev, { activePage }) => {
            window.scrollTo(0, 0);
            setPage(activePage);
          }}
          totalPages={Math.ceil(children.length / size)}
          ellipsisItem={{
            content: <Icon name="ellipsis horizontal" />,
            icon: true,
          }}
          firstItem={{
            content: <Icon name="angle double left" />,
            icon: true,
          }}
          lastItem={{
            content: <Icon name="angle double right" />,
            icon: true,
          }}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
          boundaryRange={3}
          siblingRange={5}
        />
      </Grid.Column>
    </Grid>
  );
}

export default PaginationWrapper;
