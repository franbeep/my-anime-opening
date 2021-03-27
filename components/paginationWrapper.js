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
import { useState } from "react";

function PaginationWrapper({ children }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const paginatedChildren = () => {
    const offset = (page - 1) * size;
    return children.slice(offset, offset + size);
  };

  return (
    <Grid
      columns={1}
      style={{
        margin: "1em",
        marginBottom: "10em",
      }}
    >
      <Grid.Column>
        <Grid columns={5}>
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
        />
      </Grid.Column>
    </Grid>
  );
}

export default PaginationWrapper;
