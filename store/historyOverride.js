(function(history) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
  
    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      return result;
    };
    
    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      return result;
    };
  })(window.history);