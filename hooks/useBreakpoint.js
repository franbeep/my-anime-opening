import React from "react";

// from: https://www.reddit.com/r/reactjs/comments/14w18ow/small_and_efficient_usebreakpoints_hook/

export default (breakpoints) => {
  const searchBreakpoint = React.useCallback((breakpoints) => {
    return breakpoints.find((x) => window.innerWidth < x.value)?.key;
  }, []);

  const entries = React.useMemo(() => {
    return Object.entries(breakpoints)
      .sort((a, b) => a[1] - b[1])
      .map(([key, value]) => ({ key, value }));
  }, [breakpoints]);

  const [breakpoint, setBreakpoint] = React.useState(searchBreakpoint(entries));

  React.useEffect(() => {
    const onResize = () => {
      setBreakpoint(searchBreakpoint(entries));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [entries, searchBreakpoint]);

  return breakpoint;
};
