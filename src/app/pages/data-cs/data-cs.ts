import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-data',
  imports:[CommonModule,RouterLink],
  templateUrl: './data-cs.html',
  styleUrls: ['./data-cs.css']
})
export class DataComponent implements OnInit {
  apiData: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getData().subscribe({
      next: (response:any) => {
        // Based on typical data.gov.in structure, data is in 'records'
        this.apiData = response.records;
        this.isLoading = false;
      },
      error: (error:any) => {
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
        console.error(error);
      }
    });
  }
  
}