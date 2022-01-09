package es.codeurjc.mastercloudapps.topo.controller;

import es.codeurjc.mastercloudapps.topo.model.City;
import es.codeurjc.mastercloudapps.topo.model.CityDTO;
import es.codeurjc.mastercloudapps.topo.service.TopoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/topographicdetails")
public class TopoController {

    @Autowired
    private TopoService topoService;

    @GetMapping("/{city}")
    public Mono<CityDTO> getCity(@PathVariable String city) {
        log.info("Received request: {}", city);
        return topoService.getCity(city).map(this::toCityDTO);
    }

    private CityDTO toCityDTO(City city) {
        log.info("Returning landscape: {}", city.getLandscape());
        return new CityDTO(city.getId(), city.getLandscape());
    }

}
