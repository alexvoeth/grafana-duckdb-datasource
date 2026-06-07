package plugin

import (
	"fmt"
	"strings"
)

// quoteSQLString wraps s in single quotes, escaping embedded quotes per SQL rules.
func quoteSQLString(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

// normalizeQuackURI ensures the address uses the quack: scheme without double-prefixing.
func normalizeQuackURI(addr string) string {
	addr = strings.TrimSpace(addr)
	lower := strings.ToLower(addr)
	if strings.HasPrefix(lower, "quack:") || strings.HasPrefix(lower, "quack://") {
		return addr
	}
	return "quack:" + addr
}

// buildQuackQuery wraps user SQL in a quack_query() call for remote execution.
// Skips re-wrapping when the query is already a quack_query invocation.
func buildQuackQuery(addr, sql string) string {
	trimmed := strings.TrimSpace(sql)
	if strings.HasPrefix(strings.ToLower(trimmed), "from quack_query(") {
		return sql
	}
	uri := quoteSQLString(normalizeQuackURI(addr))
	query := quoteSQLString(sql)
	return fmt.Sprintf("FROM quack_query(%s, %s, disable_ssl => true)", uri, query)
}
