package plugin

import (
	"strings"
	"testing"
)

func TestQuoteSQLString(t *testing.T) {
	tests := []struct {
		in, want string
	}{
		{"SELECT 1", "'SELECT 1'"},
		{"it's", "'it''s'"},
		{"''", "''''''"},
	}
	for _, tc := range tests {
		if got := quoteSQLString(tc.in); got != tc.want {
			t.Errorf("quoteSQLString(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestNormalizeQuackURI(t *testing.T) {
	tests := []struct {
		in, want string
	}{
		{"remote.com:9494", "quack:remote.com:9494"},
		{"  localhost  ", "quack:localhost"},
		{"quack:localhost", "quack:localhost"},
		{"quack://localhost", "quack://localhost"},
	}
	for _, tc := range tests {
		if got := normalizeQuackURI(tc.in); got != tc.want {
			t.Errorf("normalizeQuackURI(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestBuildQuackQuery(t *testing.T) {
	got := buildQuackQuery("remote.com:9494", "SELECT 1")
	want := "FROM quack_query('quack:remote.com:9494', 'SELECT 1', disable_ssl => true)"
	if got != want {
		t.Errorf("buildQuackQuery simple:\ngot  %q\nwant %q", got, want)
	}

	got = buildQuackQuery("host", "SELECT 'it''s'")
	want = "FROM quack_query('quack:host', 'SELECT ''it''''s''', disable_ssl => true)"
	if got != want {
		t.Errorf("buildQuackQuery escaped quotes:\ngot  %q\nwant %q", got, want)
	}

	multiline := "SELECT *\nFROM t\nWHERE x = 'a''b'"
	got = buildQuackQuery("host", multiline)
	if !strings.Contains(got, "'SELECT *\nFROM t\nWHERE x = ''a''''b''") {
		t.Errorf("buildQuackQuery multiline missing expected content: %q", got)
	}

	already := "FROM quack_query('quack:host', 'SELECT 1')"
	if buildQuackQuery("host", already) != already {
		t.Errorf("buildQuackQuery should not double-wrap")
	}

	if buildQuackQuery("quack:host:9494", "SELECT 1") !=
		"FROM quack_query('quack:host:9494', 'SELECT 1', disable_ssl => true)" {
		t.Errorf("buildQuackQuery should preserve pre-prefixed URI")
	}
}
