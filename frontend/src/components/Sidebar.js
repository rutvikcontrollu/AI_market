function Sidebar({ history, onNewChat }) {
  return (
    <div className="sidebar">

      <div className="logo">
        🚀 InfraBeat
      </div>

      <button
        className="new-chat-btn"
        onClick={onNewChat}
      >
        + New Analysis
      </button>

      <div className="history-section">

        <p className="history-heading">
          Recent Searches
        </p>

        {history.length === 0 ? (
          <p className="empty-history">
            No searches yet
          </p>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="history-item"
            >
              {item}
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Sidebar;