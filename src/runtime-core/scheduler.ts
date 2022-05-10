const queue = [];
let flag = false;
let p = Promise.resolve();
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

export function queueJobs(job) {
  //在这里收集对应的的update
  if (!queue.includes(job)) {
    queue.push(job);
  }

  queueFlush();
}

function queueFlush() {
  if (flag) return;
  flag = true;

  nextTick(flushJobs);
}

function flushJobs() {
  flag = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
