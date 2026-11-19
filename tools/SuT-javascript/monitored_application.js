/*
 * Adapted from MooBench's MonitoredClassSimple.java.
 * Copyright 2014 Kieker Project (http://kieker-monitoring.net)
 * Licensed under the Apache License, Version 2.0.
 * https://www.apache.org/licenses/LICENSE-2.0
 */

function monitoredMethod(methodTime, recursionDepth) {
    if (recursionDepth > 1) {
        return monitoredMethod(methodTime, recursionDepth - 1);
    }

    const exitTime = process.hrtime.bigint() + methodTime;
    let currentTime;
    do {
        currentTime = process.hrtime.bigint();
    } while (currentTime < exitTime);

    return currentTime;
}

module.exports = { monitoredMethod };
