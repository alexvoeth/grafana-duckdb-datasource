package plugin

import (
	"context"
	"database/sql/driver"
)

// quackConnector wraps a DuckDB connector so QueryContext routes SQL through quack_query().
type quackConnector struct {
	inner driver.Connector
	addr  string
}

func (c *quackConnector) Connect(ctx context.Context) (driver.Conn, error) {
	conn, err := c.inner.Connect(ctx)
	if err != nil {
		return nil, err
	}
	return &quackConn{Conn: conn, addr: c.addr}, nil
}

func (c *quackConnector) Driver() driver.Driver {
	return c.inner.Driver()
}

type quackConn struct {
	driver.Conn
	addr string
}

func (c *quackConn) QueryContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	qc, ok := c.Conn.(driver.QueryerContext)
	if !ok {
		return nil, driver.ErrSkip
	}
	return qc.QueryContext(ctx, buildQuackQuery(c.addr, query), args)
}
