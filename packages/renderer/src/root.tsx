import React from "react";

export function Root() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full flex justify-center items-center">
        <div className="w-sm flex flex-col items-center gap-3 p-5 bg-white border">
          <div>Counter = {count}</div>
          <button
            className="w-full bg-gray-600 hover:bg-gray-700 text-white border"
            onClick={() => setCount((v) => v + 1)}
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
