function getActuatorReturnPart(label) {
  return `(source)-[r:${label}]->(dest)
                RETURN 
                {
                 id: dest.uuid,
                 name: dest.name,
                 x: draw.x, 
                 y: draw.y, 
                 actuatorId: am.uuid,
                 actuatorName: am.name,
                 programId: program.uuid
                } as retdest, 
                {
                 source: source.uuid, 
                 destination: dest.uuid, 
                 name: type(r), 
                 id: r.uuid, 
                 body: r.body, 
                 rate: r.rate 
                } as relation`;
}

module.exports = getActuatorReturnPart;
