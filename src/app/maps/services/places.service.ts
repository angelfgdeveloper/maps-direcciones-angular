import { Injectable } from '@angular/core';
import { PlacesApiClient } from '../api';
import { MapService } from './map.service';

import { Feature, PlacesResponse } from '../interfaces/places.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  public useLocation?: [number, number];
  public isLoadingPlaces: boolean = false;
  public places: Feature[] = [];

  get isUserLocationReady(): boolean {
    // ! no hay un valor, la segunda ! lo mando en true
    return !!this.useLocation;
  }

  constructor(
    private placesApi: PlacesApiClient,
    private mapService: MapService,
  ) {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]> {

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.useLocation = [coords.longitude, coords.latitude];
          resolve(this.useLocation);
        },
        (err) => {
          alert('No se pudo obtener la geolocalización')
          console.log(err);
          reject();
        }
      );

    });
  }

  getPlacesByQuery(query: string = '') {
    // Evaluar cuando el query es null
    if (query.length === 0) {
      this.isLoadingPlaces = false;
      this.places = [];
      return;
    }

    if (!this.useLocation) throw Error('No hay useLocation');

    this.isLoadingPlaces = true;

    // API get personalizado
    this.placesApi.get<PlacesResponse>(`/${ query }.json?`, {
      params: {
        proximity: this.useLocation?.join(',')
      }
    })
    .subscribe(resp => {
      // console.log(resp.features);
      this.isLoadingPlaces = false;
      this.places = resp.features;

      this.mapService.createMarkersFromPlaces(this.places, this.useLocation!);
    });
  }

  deletePlaces() {
    this.places = [];
  }

}
