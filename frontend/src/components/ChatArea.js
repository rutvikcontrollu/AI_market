function ChatArea({
  keyword,
  setKeyword,
  loading,
  analyzeKeyword
}) {
  return (
    <div className="welcome-screen">

      <div className="welcome-content">

        <h1 className="welcome-title">
          🚀 InfraBeat
        </h1>

        <h2 className="welcome-subtitle">
          Discover startup opportunities before everyone else.
        </h2>

        <div className="prompt-container">

          <input
            type="text"
            className="prompt-input"
            placeholder="Ask about AI Agents, SaaS, Fintech..."
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                analyzeKeyword();
              }
            }}
          />

          <button
            className="analyze-btn"
            onClick={analyzeKeyword}
          >
            {loading
              ? "Analyzing..."
              : "Analyze"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ChatArea;